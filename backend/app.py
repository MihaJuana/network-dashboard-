import os
import logging
import mysql.connector
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)
logging.basicConfig(level=logging.INFO)

# --- Database helper ---


def get_db():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="flaskuser",
        password="Temp123!@#",
        database="rackdb"
    )

# --- Initialize database ---


def init_db():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sites (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(255),
        floor VARCHAR(50)
    )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS racks (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            site_id BIGINT,
            name VARCHAR(255),
            size INT,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipment (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rack_id BIGINT,
            slot_index INT,
            type VARCHAR(50),
            text VARCHAR(255),
            u_size INT,
            FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE
        )
    """)
    db.commit()
    cursor.close()
    db.close()


try:
    init_db()
    app.logger.info("✅ Database schema ensured at startup")
except Exception as e:
    app.logger.exception(f"❌ DB init failed: {e}")


# --- API ROUTES ---

@app.route("/api/load-layout", methods=["GET"])
def load_layout():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM sites")
        sites = cursor.fetchall()
        rackData, rackNames = {}, {}

        for site in sites:
            site_id = site["id"]
            rackData[site_id] = {}
            cursor.execute("SELECT * FROM racks WHERE site_id=%s", (site_id,))
            racks = cursor.fetchall()

            for rack in racks:
                rack_id = rack["id"]
                rackNames[str(rack_id)] = rack["name"]
                size = rack["size"]
                slots = [None] * size

                cursor.execute(
                    "SELECT * FROM equipment WHERE rack_id=%s ORDER BY slot_index", (rack_id,))
                for eq in cursor.fetchall():
                    eq_obj = {
                        "type": eq["type"],
                        "text": eq["text"],
                        "u": eq["u_size"],
                        "occupied": False,
                    }
                    idx = eq["slot_index"] - 1
                    if idx < len(slots):
                        slots[idx] = eq_obj
                        for i in range(1, eq["u_size"]):
                            if idx + i < len(slots):
                                slots[idx + i] = {**eq_obj, "occupied": True}

                rackData[site_id][rack_id] = {"size": size, "slots": slots}

        return jsonify({"sites": sites, "rackData": rackData, "rackNames": rackNames})
    except Exception as e:
        app.logger.exception(f"Load layout error: {e}")
        return jsonify({"error": "Failed to load layout"}), 500
    finally:
        cursor.close()
        conn.close()


# ✅ Save layout (UPSERT — prevents duplicates)
@app.route("/api/save", methods=["POST", "OPTIONS"])
@app.route("/api/save/", methods=["POST", "OPTIONS"])
def save_layout():
    if request.method == "OPTIONS":
        return '', 204  # CORS preflight OK

    conn = None
    try:
        data = request.get_json(force=True)
        sites = data.get("sites", [])
        rackData = data.get("rackData", {})
        rackNames = data.get("rackNames", {})

        conn = get_db()
        cursor = conn.cursor()
        conn.autocommit = False

        site_map = {}

        # --- UPSERT for sites ---
        for site in sites:
            site_id = site.get("id")
            location = site.get("location", "").strip()
            floor = site.get("floor", "").strip()

            # ✅ Match by location (and floor)
            cursor.execute(
                "SELECT id FROM sites WHERE location=%s AND floor=%s", (location, floor))
            existing = cursor.fetchone()

            if existing:
                db_site_id = existing[0]
                cursor.execute("""
                    UPDATE sites SET location=%s, floor=%s WHERE id=%s
                """, (location, floor, db_site_id))
                site_map[str(site_id)] = db_site_id
            else:
                cursor.execute("""
                    INSERT INTO sites (location, floor) VALUES (%s, %s)
                """, (location, floor))
                new_id = cursor.lastrowid
                site_map[str(site_id)] = new_id

        # --- UPSERT for racks + equipment ---
        for site_id, racks in rackData.items():
            db_site_id = site_map.get(str(site_id))
            if not db_site_id:
                continue

            for rack_id, rack in racks.items():
                rack_name = rackNames.get(rack_id, f"Rack_{rack_id}")
                size = rack.get("size", 42)

                # Match rack by name + site_id
                cursor.execute("""
                    SELECT id FROM racks WHERE site_id=%s AND name=%s
                """, (db_site_id, rack_name))
                existing_rack = cursor.fetchone()

                if existing_rack:
                    db_rack_id = existing_rack[0]
                    cursor.execute("""
                        UPDATE racks SET size=%s WHERE id=%s
                    """, (size, db_rack_id))
                    cursor.execute(
                        "DELETE FROM equipment WHERE rack_id=%s", (db_rack_id,))
                else:
                    cursor.execute("""
                        INSERT INTO racks (site_id, name, size) VALUES (%s, %s, %s)
                    """, (db_site_id, rack_name, size))
                    db_rack_id = cursor.lastrowid

                # Reinsert equipment
                for i, slot in enumerate(rack.get("slots", [])):
                    if slot and not slot.get("occupied"):
                        cursor.execute("""
                            INSERT INTO equipment (rack_id, slot_index, type, text, u_size)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (db_rack_id, i + 1, slot["type"], slot["text"], slot["u"]))

        conn.commit()
        return jsonify({
            "message": "Save successful ✅",
            "site_map": site_map
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.exception(f"Save failed: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


# --- DELETE Routes ---
@app.route("/api/delete/site/<int:site_id>", methods=["DELETE"])
def delete_site(site_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM sites WHERE id=%s", (site_id,))
        conn.commit()
        return jsonify({"message": f"Site {site_id} deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/delete/rack/<int:rack_id>", methods=["DELETE"])
def delete_rack(rack_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM racks WHERE id=%s", (rack_id,))
        conn.commit()
        return jsonify({"message": f"Rack {rack_id} deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# --- React fallback ---
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
