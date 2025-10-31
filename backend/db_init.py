from utils.db_utils import connect_db
from utils.safe_print import safe_print as print

from config import (
    ROOT_USER, ROOT_PASS,
    RACK_DB_NAME, RACK_USER, RACK_PASS,
    PATCH_DB_NAME, PATCH_USER, PATCH_PASS
)
from models.rack_model import init_rack_schema
from models.patch_model import init_patch_schema

def ensure_databases():
    """Create rackdb and patchdb if missing."""
    conn = connect_db(ROOT_USER, ROOT_PASS)
    cur = conn.cursor()
    cur.execute(f"CREATE DATABASE IF NOT EXISTS {RACK_DB_NAME}")
    cur.execute(f"CREATE DATABASE IF NOT EXISTS {PATCH_DB_NAME}")
    conn.commit()
    cur.close()
    conn.close()
    
    
    
import sys

def safe_print(msg):
    """Print safely across terminals that may not support UTF-8."""
    encoding = getattr(sys.stdout, "encoding", "").upper()
    if "UTF-8" in encoding or sys.platform != "win32":
        print(msg)
    else:
        print(msg.encode("ascii", "ignore").decode())


def init_all_schemas():
    """Initialize schemas for both databases."""
    init_rack_schema()
    init_patch_schema()

from utils.safe_print import safe_print
safe_print("✅ Databases verified/created.")
from utils.safe_print import safe_print
safe_print("✅ RackDB schema initialized.")
from utils.safe_print import safe_print
safe_print("✅ PatchDB schema initialized.")
