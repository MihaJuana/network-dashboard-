import os
from dotenv import load_dotenv
import sys
from utils.safe_print import safe_print as print


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

if not os.path.exists(ENV_PATH):
    with open(ENV_PATH, "w") as f:
        f.write("""# Auto-generated .env file
DB_HOST=127.0.0.1
DB_PORT=3306

# Root credentials (used once to auto-create DBs/users)
DB_ROOT_USER=root
DB_ROOT_PASS=Temp123!@#

# Rack database
RACK_DB_NAME=rackdb
RACK_DB_USER=flaskuser
RACK_DB_PASS=Temp123!@#

# Patch database
PATCH_DB_NAME=patchdb
PATCH_DB_USER=patchuser
PATCH_DB_PASS=Temp123!@#

# Flask environment
FLASK_ENV=development
""")
    print("Note: .env file created with defaults — edit backend/.env as needed.")

load_dotenv(ENV_PATH)

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

ROOT_USER = os.getenv("DB_ROOT_USER", "root")
ROOT_PASS = os.getenv("DB_ROOT_PASS", "")

RACK_DB_NAME = os.getenv("RACK_DB_NAME", "rackdb")
RACK_USER = os.getenv("RACK_DB_USER", "flaskuser")
RACK_PASS = os.getenv("RACK_DB_PASS", "Temp123!@#")

PATCH_DB_NAME = os.getenv("PATCH_DB_NAME", "patchdb")
PATCH_USER = os.getenv("PATCH_DB_USER", "patchuser")
PATCH_PASS = os.getenv("PATCH_DB_PASS", "Temp123!@#")

FLASK_ENV = os.getenv("FLASK_ENV", "development")

def print_config_summary():
    encoding = getattr(sys.stdout, "encoding", "").upper()
    supports_unicode = "UTF-8" in encoding or sys.platform != "win32"

    def safe(text):
        return text if supports_unicode else text.encode("ascii", "ignore").decode()

    print()
    print(safe("Flask Configuration Summary:"))
    print(safe(f"Environment: {FLASK_ENV}"))
    print(safe(f"DB Host: {DB_HOST}:{DB_PORT}"))
    print(safe(f"Rack DB: {RACK_DB_NAME} (user={RACK_USER})"))
    print(safe(f"Patch DB: {PATCH_DB_NAME} (user={PATCH_USER})"))
    print(safe(f"Root user: {ROOT_USER}"))
    print(safe(f"Loaded from: {ENV_PATH}\n"))
