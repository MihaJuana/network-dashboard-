import os
import logging
from flask import Flask, jsonify, send_file, request
from flask_cors import CORS

# Add backend path for imports
import sys
sys.path.append(os.path.dirname(__file__))

# --------------------------------------------------
# SAFE PRINT (for Windows console emoji issues)
# --------------------------------------------------
from utils.safe_print import safe_print
import builtins
builtins.print = safe_print

# --------------------------------------------------
# IMPORT CONFIG + INITIALIZATION
# --------------------------------------------------
from config import print_config_summary

try:
    from db_init import ensure_databases, init_all_schemas
except ModuleNotFoundError:
    from backend.db_init import ensure_databases, init_all_schemas

# --------------------------------------------------
# BLUEPRINT ROUTES
# --------------------------------------------------
from routes.rack_api import rack_bp
from routes.patch_api import patch_bp


# --------------------------------------------------
# APP FACTORY
# --------------------------------------------------
def create_app():
    app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
    CORS(app)
    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)

    # 🧩 Print config summary (shows DB info, environment, etc.)
    print_config_summary()

    # 🧱 Ensure DBs + schemas are created
    ensure_databases()
    init_all_schemas()

    # 🔌 Register blueprints (routes)
    app.register_blueprint(rack_bp, url_prefix="/api")
    app.register_blueprint(patch_bp, url_prefix="/api")

    # --------------------------------------------------
    # ERROR HANDLERS
    # --------------------------------------------------
    @app.errorhandler(405)
    def handle_405(e):
        return jsonify({
            "error": "Method not allowed",
            "allowed_methods": list(e.valid_methods) if hasattr(e, "valid_methods") else []
        }), 405

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({"error": "Internal server error"}), 500

    return app




# --------------------------------------------------
# MAIN ENTRY POINT
# --------------------------------------------------
if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
