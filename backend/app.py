import os
import mysql.connector
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# --- DB Helpers ---


def get_db():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="flaskuser",
        password="Temp123!@#",
        database="rackdb"
    )


def init_db():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sites (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(255),
        floor VARCHAR(50)
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS racks (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        site_id BIGINT,
        name VARCHAR(255),
        size INT,
        FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rack_id BIGINT,
        slot_index INT,
        type VARCHAR(50),
        text VARCHAR(255),
        u_size INT,
        FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE
    )""")
    db.commit()
    cursor.close()
    db.close()
    app.logger.info("✅ Database schema ensured.")


# ✅ Call init_db() once on import (safe in Gunicorn + Flask 3.x)
try:
    init_db()
except Exception as e:
    app.logger.exception(f"❌ Database initialization failed: {e}")

# --- API Routes ---


@app.route("/save", methods=["POST"])
def save_layout():
    import traceback
    conn = None
    cursor = None
    try:
        data = request.get_json()
        sites = data.get("sites", [])
        rackData = data.get("rackData", {})
        rackNames = data.get("rackNames", {})

        conn = get_db()
        cursor = conn.cursor()
        conn.autocommit = False

        site_map = {}
        for site in sites:
            location = site.get("location", "")
            floor = site.get("floor", "")
            site_id = site.get("id")

            if site_id and isinstance(site_id, int):
                cursor.execute(
                    "SELECT id FROM sites WHERE id = %s", (site_id,))
                if cursor.fetchone():
                    cursor.execute(
                        "UPDATE sites SET location=%s, floor=%s WHERE id=%s",
                        (location, floor, site_id),
                    )
                    site_map[str(site_id)] = site_id
                else:
                    cursor.execute(
                        "INSERT INTO sites (location, floor) VALUES (%s, %s)",
                        (location, floor),
                    )
                    site_map[str(site_id)] = cursor.lastrowid
            else:
                cursor.execute(
                    "INSERT INTO sites (location, floor) VALUES (%s, %s)",
                    (location, floor),
                )
                site_map[str(site_id)] = cursor.lastrowid

        for site_id, racks in rackData.items():
            db_site_id = site_map.get(str(site_id))
            if not db_site_id:
                continue

            for rack_id, rack in racks.items():
                rack_name = rackNames.get(rack_id, f"Rack_{rack_id}")
                rack_size = rack.get("size", 42)
                cursor.execute(
                    "INSERT INTO racks (site_id, name, size) VALUES (%s, %s, %s)",
                    (db_site_id, rack_name, rack_size),
                )
                db_rack_id = cursor.lastrowid

                cursor.execute(
                    "DELETE FROM equipment WHERE rack_id = %s", (db_rack_id,))
                for slot_index, slot in enumerate(rack.get("slots", [])):
                    if slot and not slot.get("occupied"):
                        cursor.execute(
                            """INSERT INTO equipment (rack_id, slot_index, type, text, u_size)
                               VALUES (%s, %s, %s, %s, %s)""",
                            (
                                db_rack_id,
                                slot_index + 1,
                                slot.get("type", ""),
                                slot.get("text", ""),
                                slot.get("u", 1),
                            ),
                        )

        conn.commit()
        return jsonify({"message": "Save successful ✅"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/load-layout", methods=["GET"])
def load_layout():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM sites")
        sites = cursor.fetchall()
        rackData = {}
        rackNames = {}

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
                    "SELECT * FROM equipment WHERE rack_id=%s ORDER BY slot_index",
                    (rack_id,),
                )
                equipment_list = cursor.fetchall()

                max_slot_index = 0
                for eq in equipment_list:
                    max_slot_index = max(max_slot_index, eq["slot_index"])

                if max_slot_index >= size:
                    slots.extend([None] * (max_slot_index - size + 1))
                    size = max_slot_index + 1

                for eq in equipment_list:
                    eq_obj = {
                        "type": eq["type"],
                        "text": eq["text"],
                        "u": eq["u_size"],
                        "occupied": False,
                    }
                    slots[eq["slot_index"]] = eq_obj
                    for i in range(1, eq["u_size"]):
                        if eq["slot_index"] + i < len(slots):
                            slots[eq["slot_index"] +
                                  i] = {**eq_obj, "occupied": True}

                rackData[site_id][rack_id] = {"size": size, "slots": slots}

        return jsonify({"sites": sites, "rackData": rackData, "rackNames": rackNames})
    except Exception as e:
        app.logger.exception(f"Load layout error: {e}")
        return jsonify({"error": "Failed to load layout"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/delete/site/<int:site_id>", methods=["DELETE"])
def delete_site(site_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM sites WHERE id = %s", (site_id,))
        conn.commit()
        return jsonify({"message": f"Site {site_id} deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/delete/rack/<int:rack_id>", methods=["DELETE"])
def delete_rack(rack_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM racks WHERE id = %s", (rack_id,))
        conn.commit()
        return jsonify({"message": f"Rack {rack_id} deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/delete/equipment/<int:eq_id>", methods=["DELETE"])
def delete_equipment(eq_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM equipment WHERE id = %s", (eq_id,))
        conn.commit()
        return jsonify({"message": f"Equipment {eq_id} deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# --- React SPA catch-all ---


@app.route("/")
@app.route("/<path:path>")
def serve_react(path=None):
    build_dir = os.path.join(os.path.dirname(__file__), "../frontend/build")
    if path and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    return send_from_directory(build_dir, "index.html")


if __name__ == "__main__":
    # Only for local debugging — Gunicorn will ignore this
    app.run(host="0.0.0.0", port=5000, debug=True)
