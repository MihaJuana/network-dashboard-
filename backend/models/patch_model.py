import mysql.connector
import tempfile
import pdfkit
from flask import send_file
from config import PATCH_DB_NAME, PATCH_USER, PATCH_PASS, DB_HOST, DB_PORT
from utils.db_utils import connect_db

# -----------------------------
# DB CONNECTION
# -----------------------------
def get_db():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=PATCH_USER,
        password=PATCH_PASS,
        database=PATCH_DB_NAME,
    )

# -----------------------------
# SCHEMA INITIALIZER
# -----------------------------
def init_patch_schema():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255)
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS panels (
            id INT AUTO_INCREMENT PRIMARY KEY,
            site_id INT,
            name VARCHAR(255),
            total_ports INT,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS port_labels (
            id INT AUTO_INCREMENT PRIMARY KEY,
            panel_id INT,
            port_number INT,
            label_text VARCHAR(255),
            color VARCHAR(20),
            FOREIGN KEY (panel_id) REFERENCES panels(id) ON DELETE CASCADE
        )
    """)
    db.commit()
    cur.close()
    db.close()
    print("✅ PatchDB schema initialized.")

# -----------------------------
# MODEL FUNCTIONS
# -----------------------------
def save_patch_data(sites):
    """Save patch panel hierarchy (sites, panels, port labels)."""
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("DELETE FROM port_labels")
        cur.execute("DELETE FROM panels")
        cur.execute("DELETE FROM sites")

        for site in sites:
            cur.execute("INSERT INTO sites (id, name) VALUES (%s, %s)", (site["id"], site["name"]))
            for panel in site.get("panels", []):
                cur.execute(
                    "INSERT INTO panels (id, site_id, name, total_ports) VALUES (%s, %s, %s, %s)",
                    (panel["id"], site["id"], panel["name"], panel.get("total_ports", 48))
                )
                for label in panel.get("labels", []):
                    cur.execute(
                        "INSERT INTO port_labels (panel_id, port_number, label_text, color) VALUES (%s, %s, %s, %s)",
                        (panel["id"], label["port_number"], label["label_text"], label["color"])
                    )

        db.commit()
        return {"message": "Saved successfully!"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        cur.close()
        db.close()


def get_patch_sites():
    """Fetch all sites, panels, and port labels."""
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM sites")
        sites = cur.fetchall()
        for site in sites:
            cur.execute("SELECT * FROM panels WHERE site_id=%s", (site["id"],))
            panels = cur.fetchall()
            for panel in panels:
                cur.execute("SELECT * FROM port_labels WHERE panel_id=%s", (panel["id"],))
                panel["labels"] = cur.fetchall()
            site["panels"] = panels
        return sites
    finally:
        cur.close()
        db.close()


def export_panel_to_pdf(panel_id):
    """Generate a PDF for a patch panel."""
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT s.name AS site_name, p.name AS panel_name, p.total_ports,
                   pl.port_number, pl.label_text, pl.color
            FROM panels p
            JOIN sites s ON s.id = p.site_id
            LEFT JOIN port_labels pl ON pl.panel_id = p.id
            WHERE p.id = %s
            ORDER BY pl.port_number
        """, (panel_id,))
        rows = cur.fetchall()
    finally:
        cur.close()
        db.close()

    html = "<h2>Patch Panel Report</h2><table border='1'><tr><th>Port</th><th>Label</th><th>Color</th></tr>"
    for r in rows:
        html += f"<tr><td>{r['port_number']}</td><td>{r['label_text'] or ''}</td><td style='background:{r['color']};width:50px'></td></tr>"
    html += "</table>"

    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    pdfkit.from_string(html, tmp.name)
    return send_file(tmp.name, as_attachment=True, download_name=f"patch_panel_{panel_id}.pdf")
