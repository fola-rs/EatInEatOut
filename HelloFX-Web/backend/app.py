from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "grocery.db")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── Database helpers ─────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS lists (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT NOT NULL,
            content    TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# ── List routes ──────────────────────────────────────────────────────────────

@app.route("/api/lists", methods=["GET"])
def get_lists():
    conn = get_db()
    rows = conn.execute("SELECT * FROM lists ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/lists", methods=["POST"])
def create_list():
    data = request.get_json()
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    conn.execute(
        "INSERT INTO lists (title, content, created_at) VALUES (?, ?, ?)",
        (title, content, created_at),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "List saved successfully"}), 201

@app.route("/api/lists/<int:list_id>", methods=["DELETE"])
def delete_list(list_id):
    conn = get_db()
    conn.execute("DELETE FROM lists WHERE id = ?", (list_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "List deleted"})

# ── Image / AI route ─────────────────────────────────────────────────────────

@app.route("/api/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files["image"]
    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    try:
        from predictor import predict
        label, confidence = predict(save_path)
        return jsonify({"label": label, "confidence": round(float(confidence) * 100, 2)})
    except Exception as e:
        return jsonify({"label": "Unknown", "confidence": 0, "note": str(e)})

# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
