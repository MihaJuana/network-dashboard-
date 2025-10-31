/**
 * setup_backend.js
 * -----------------
 * Bootstraps the Flask backend: ensures venv, installs dependencies, and launches app.py.
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = __dirname;
const venvDir = path.join(backendDir, "venv");

// 🪄 Step 1: Create virtual environment if missing
if (!fs.existsSync(venvDir)) {
  console.log("🧰 Creating Python virtual environment...");
  try {
    execSync("python -m venv venv", { cwd: backendDir, stdio: "inherit" });
  } catch (err) {
    console.error("❌ Failed to create venv. Make sure Python is installed and in PATH.");
    process.exit(1);
  }
}

// 🪄 Step 2: Detect Python executable (cross-platform)
const pythonPath =
  process.platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");

// 🪄 Step 3: Install dependencies
console.log("📦 Ensuring Python packages are installed...");
const requirements = [
  "flask",
  "flask-cors",
  "mysql-connector-python",
  "pdfkit",
  "fpdf",
  "python-dotenv"
];

try {
  execSync(`${pythonPath} -m pip install --upgrade pip`, {
    cwd: backendDir,
    stdio: "inherit",
  });
  execSync(`${pythonPath} -m pip install ${requirements.join(" ")}`, {
    cwd: backendDir,
    stdio: "inherit",
  });
} catch (err) {
  console.error("❌ Failed to install Python dependencies.");
  process.exit(1);
}

// 🪄 Step 4: Run Flask backend safely
console.log("🚀 Starting Flask backend...");

// Ensure Python always starts in backend directory (important for relative imports)
const flaskProc = spawn(pythonPath, ["-u", "app.py"], {
  cwd: backendDir,
  stdio: "inherit",
  env: {
    ...process.env,
    PYTHONPATH: backendDir, // 🔑 ensures backend modules are discoverable
  },
});

flaskProc.on("exit", (code) => {
  console.log(`💡 Flask exited with code ${code}`);
});
