from utils.db_utils import connect_db
from config import RACK_DB_NAME, RACK_USER, RACK_PASS

# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------
def get_db():
    return connect_db(RACK_USER, RACK_PASS, RACK_DB_NAME)


# --------------------------------------------------
# INITIALIZE SCHEMA
# --------------------------------------------------
def init_rack_schema():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sites (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            location VARCHAR(255),
            floor VARCHAR(50)
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS racks (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            site_id BIGINT,
            name VARCHAR(255),
            size INT,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
        )
    """)
    cur.execute("""
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
    cur.close()
    db.close()
    print("✅ RackDB schema initialized.")


# --------------------------------------------------
# LOAD LAYOUT
# --------------------------------------------------
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

                cur.execute(
                    "SELECT * FROM equipment WHERE rack_id=%s ORDER BY slot_index", (rack_id,)
                )
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

        return {"sites": sites, "rackData": rackData, "rackNames": rackNames}

    finally:
        cur.close()
        conn.close()


# --------------------------------------------------
# SAVE LAYOUT (UPSERT)
# --------------------------------------------------
def save_layout(data):
    conn = None
    try:
        sites = data.get("sites", [])
        rackData = data.get("rackData", {})
        rackNames = data.get("rackNames", {})

        conn = get_db()
        cur = conn.cursor()
        conn.autocommit = False

        site_map = {}

        # UPSERT SITES
        for site in sites:
            site_id = site.get("id")
            location = site.get("location", "").strip()
            floor = site.get("floor", "").strip()

            cur.execute(
                "SELECT id FROM sites WHERE location=%s AND floor=%s", (location, floor)
            )
            existing = cur.fetchone()

            if existing:
                db_site_id = existing[0]
                cur.execute(
                    "UPDATE sites SET location=%s, floor=%s WHERE id=%s",
                    (location, floor, db_site_id),
                )
                site_map[str(site_id)] = db_site_id
            else:
                cur.execute(
                    "INSERT INTO sites (location, floor) VALUES (%s, %s)",
                    (location, floor),
                )
                new_id = cur.lastrowid
                site_map[str(site_id)] = new_id

        # UPSERT RACKS + EQUIPMENT
        for site_id, racks in rackData.items():
            db_site_id = site_map.get(str(site_id))
            if not db_site_id:
                continue

            for rack_id, rack in racks.items():
                rack_name = rackNames.get(rack_id, f"Rack_{rack_id}")
                size = rack.get("size", 42)

                cur.execute(
                    "SELECT id FROM racks WHERE site_id=%s AND name=%s",
                    (db_site_id, rack_name),
                )
                existing_rack = cur.fetchone()

                if existing_rack:
                    db_rack_id = existing_rack[0]
                    cur.execute("UPDATE racks SET size=%s WHERE id=%s", (size, db_rack_id))
                    cur.execute("DELETE FROM equipment WHERE rack_id=%s", (db_rack_id,))
                else:
                    cur.execute(
                        "INSERT INTO racks (site_id, name, size) VALUES (%s, %s, %s)",
                        (db_site_id, rack_name, size),
                    )
                    db_rack_id = cur.lastrowid

                for i, slot in enumerate(rack.get("slots", [])):
                    if slot and not slot.get("occupied"):
                        cur.execute(
                            """
                            INSERT INTO equipment (rack_id, slot_index, type, text, u_size)
                            VALUES (%s, %s, %s, %s, %s)
                            """,
                            (db_rack_id, i + 1, slot["type"], slot["text"], slot["u"]),
                        )

        conn.commit()
        return {"message": "Save successful ✅", "site_map": site_map}

    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# DELETE SITE / RACK
# --------------------------------------------------
def delete_site(site_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM sites WHERE id=%s", (site_id,))
        conn.commit()
        return {"message": f"Site {site_id} deleted"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def delete_rack(rack_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM racks WHERE id=%s", (rack_id,))
        conn.commit()
        return {"message": f"Rack {rack_id} deleted"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
