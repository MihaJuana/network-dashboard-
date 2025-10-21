import mysql.connector

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "flaskuser",
    "password": "Temp123!@#",
    "database": "rackdb",
}


def init_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # --- Create tables ---
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
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        rack_id BIGINT,
        slot_index INT,
        type VARCHAR(50),
        text VARCHAR(255),
        u_size INT,
        FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE
    )
    """)

    # --- Insert demo data if empty ---
    cursor.execute("SELECT COUNT(*) FROM sites")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO sites (location, floor) VALUES (%s, %s)",
                       ("Main Data Center", "1st Floor"))
        site_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO racks (site_id, name, size) VALUES (%s, %s, %s)", (site_id, "Rack A", 42))
        rack_id = cursor.lastrowid

        cursor.execute("""
        INSERT INTO equipment (rack_id, slot_index, type, text, u_size)
        VALUES (%s, %s, %s, %s, %s)
        """, (rack_id, 1, "server", "Demo Server", 1))

        cursor.execute("""
        INSERT INTO equipment (rack_id, slot_index, type, text, u_size)
        VALUES (%s, %s, %s, %s, %s)
        """, (rack_id, 3, "switch", "Demo Switch", 1))

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database initialized with sample data!")


if __name__ == "__main__":
    init_db()
