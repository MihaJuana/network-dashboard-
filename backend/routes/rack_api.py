from flask import Blueprint, jsonify, request
from utils.db_utils import connect_db
from config import RACK_DB_NAME, RACK_USER, RACK_PASS

rack_bp = Blueprint("rack_bp", __name__)

# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------
def get_db():
    """Connect to the Rack database."""
    return connect_db(RACK_USER, RACK_PASS, RACK_DB_NAME)

# --------------------------------------------------
# LOAD RACK LAYOUT
# --------------------------------------------------
@rack_bp.route("/load-layout", methods=["GET"])
def load_layout():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM sites")
        sites = cur.fetchall()
        rackData, rackNames = {}, {}

        for site in sites:
            site_id = site["id"]
            rackData[site_id] = {}
            cur.execute("SELECT * FROM racks WHERE site_id=%s", (site_id,))
            racks = cur.fetchall()
            for rack in racks:
                rack_id = rack["id"]
                rackNames[str(rack_id)] = rack["name"]
                size = rack["size"]
                slots = [None] * size
                cur.execute("SELECT * FROM equipment WHERE rack_id=%s ORDER BY slot_index", (rack_id,))
                for eq in cur.fetchall():
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
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# --------------------------------------------------
# DELETE SITE
# --------------------------------------------------
@rack_bp.route("/delete/site/<int:site_id>", methods=["DELETE", "OPTIONS"])
def delete_site(site_id):
    if request.method == "OPTIONS":
        # Handle CORS preflight
        return '', 204

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM sites WHERE id=%s", (site_id,))
        conn.commit()
        return jsonify({"message": f"✅ Site {site_id} deleted"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# --------------------------------------------------
# DELETE RACK
# --------------------------------------------------
@rack_bp.route("/delete/rack/<int:rack_id>", methods=["DELETE", "OPTIONS"])
def delete_rack(rack_id):
    if request.method == "OPTIONS":
        # Handle CORS preflight
        return '', 204

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM racks WHERE id=%s", (rack_id,))
        conn.commit()
        return jsonify({"message": f"✅ Rack {rack_id} deleted"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# --------------------------------------------------
# SAVE LAYOUT (UPSERT)
# --------------------------------------------------
@rack_bp.route("/save", methods=["POST", "OPTIONS"])
def save_layout():
    if request.method == "OPTIONS":
        return '', 204

    data = request.get_json()
    sites = data.get("sites", [])
    rackData = data.get("rackData", {})
    rackNames = data.get("rackNames", {})

    conn = get_db()
    cur = conn.cursor()
    site_map = {}

    try:
        conn.autocommit = False

        # UPSERT sites
        for site in sites:
            site_id = site.get("id")
            location = site.get("location", "").strip()
            floor = site.get("floor", "").strip()

            cur.execute("SELECT id FROM sites WHERE location=%s AND floor=%s", (location, floor))
            existing = cur.fetchone()

            if existing:
                db_site_id = existing[0]
                cur.execute("UPDATE sites SET location=%s, floor=%s WHERE id=%s", (location, floor, db_site_id))
                site_map[str(site_id)] = db_site_id
            else:
                cur.execute("INSERT INTO sites (location, floor) VALUES (%s, %s)", (location, floor))
                site_map[str(site_id)] = cur.lastrowid

        # UPSERT racks + equipment
        for site_id, racks in rackData.items():
            db_site_id = site_map.get(str(site_id))
            if not db_site_id:
                continue

            for rack_id, rack in racks.items():
                rack_name = rackNames.get(rack_id, f"Rack_{rack_id}")
                size = rack.get("size", 42)

                cur.execute("SELECT id FROM racks WHERE site_id=%s AND name=%s", (db_site_id, rack_name))
                existing_rack = cur.fetchone()

                if existing_rack:
                    db_rack_id = existing_rack[0]
                    cur.execute("UPDATE racks SET size=%s WHERE id=%s", (size, db_rack_id))
                    cur.execute("DELETE FROM equipment WHERE rack_id=%s", (db_rack_id,))
                else:
                    cur.execute("INSERT INTO racks (site_id, name, size) VALUES (%s, %s, %s)", (db_site_id, rack_name, size))
                    db_rack_id = cur.lastrowid

                for i, slot in enumerate(rack.get("slots", [])):
                    if slot and not slot.get("occupied"):
                        cur.execute("""
                            INSERT INTO equipment (rack_id, slot_index, type, text, u_size)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (db_rack_id, i + 1, slot["type"], slot["text"], slot["u"]))

        conn.commit()
        return jsonify({"message": "Save successful ✅", "site_map": site_map}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
