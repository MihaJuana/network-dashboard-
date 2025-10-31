from flask import Blueprint, jsonify, request
from models.patch_model import save_patch_data, get_patch_sites, export_panel_to_pdf

patch_bp = Blueprint("patch_bp", __name__)

@patch_bp.route("/patch/save", methods=["POST"])
def api_save_patch_data():
    try:
        data = request.get_json()
        sites = data.get("sites", [])
        result = save_patch_data(sites)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@patch_bp.route("/patch/sites", methods=["GET"])
def api_get_patch_sites():
    try:
        sites = get_patch_sites()
        return jsonify(sites)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@patch_bp.route("/patch/export-pdf/<int:panel_id>", methods=["GET"])
def api_export_pdf(panel_id):
    try:
        return export_panel_to_pdf(panel_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
