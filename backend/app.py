from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/run-playbook', methods=['POST'])
def run_playbook():
    data = request.json
    target = data.get('target')
    playbook = data.get('playbook')

    if not target or not playbook:
        return jsonify({'error': 'Missing target or playbook'}), 400

    try:
        command = [
            'ansible-playbook',
            f'ansible/playbooks/{playbook}',
            '-i', 'ansible/inventory.ini',
            '--extra-vars', f"target={target}"
        ]
        result = subprocess.run(command, capture_output=True, text=True)
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)