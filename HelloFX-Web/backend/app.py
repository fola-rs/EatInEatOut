from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
import sqlite3
import os
from datetime import datetime

# ── Request body models ──────────────────────────────────────────────────────
# FastAPI uses Pydantic models instead of request.get_json() to parse and
# validate incoming JSON bodies — if a required field is missing, FastAPI
# automatically returns a 422 error before your function even runs.

class ListCreate(BaseModel):
    title: str
    content: str

class PantryItemCreate(BaseModel):
    name: str
    category: str = "other"
    quantity: float = 1
    unit: str = ""
    expires_at: Optional[str] = None

class PantryItemUpdate(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    expires_at: Optional[str] = None

# ── App setup ────────────────────────────────────────────────────────────────

# lifespan replaces Flask's if __name__ == "__main__" init call;
# init_db() runs once when the server starts, before any requests are handled.
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Allow the React dev server (port 3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "grocery.db")

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
    conn.execute("""
        CREATE TABLE IF NOT EXISTS pantry_items (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            category   TEXT NOT NULL DEFAULT 'other',
            quantity   REAL NOT NULL DEFAULT 1,
            unit       TEXT NOT NULL DEFAULT '',
            expires_at TEXT,
            added_at   TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# ── List routes ──────────────────────────────────────────────────────────────
# In FastAPI: return plain dicts/lists — no jsonify() needed.
# Path params go in curly braces {list_id} and are typed in the function sig.
# Errors use raise HTTPException(...) instead of return ..., 400.

@app.get("/api/lists")
def get_lists():
    conn = get_db()
    rows = conn.execute("SELECT * FROM lists ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/lists", status_code=201)
def create_list(data: ListCreate):
    # Pydantic already confirmed title/content exist; still reject blank strings.
    title   = data.title.strip()
    content = data.content.strip()
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content are required")
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    conn.execute(
        "INSERT INTO lists (title, content, created_at) VALUES (?, ?, ?)",
        (title, content, created_at),
    )
    conn.commit()
    conn.close()
    return {"message": "List saved successfully"}

@app.delete("/api/lists/{list_id}")
def delete_list(list_id: int):
    conn = get_db()
    conn.execute("DELETE FROM lists WHERE id = ?", (list_id,))
    conn.commit()
    conn.close()
    return {"message": "List deleted"}

# ── Pantry routes ────────────────────────────────────────────────────────────
# IMPORTANT: /expiring-soon must be defined BEFORE /{item_id} — same reason
# as Flask, FastAPI also tries to match routes top-to-bottom.

# Route 5 – GET /api/pantry/expiring-soon
@app.get("/api/pantry/expiring-soon")
def get_expiring_soon():
    conn = get_db()
    rows = conn.execute("""
        SELECT * FROM pantry_items
        WHERE expires_at IS NOT NULL
          AND expires_at <= date('now', '+3 days')
        ORDER BY expires_at ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# Route 1 – GET /api/pantry
@app.get("/api/pantry")
def get_pantry_items():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM pantry_items ORDER BY category, name"  # fixed: 'then' is not valid SQL
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# Route 2 – POST /api/pantry
@app.post("/api/pantry", status_code=201)
def create_pantry_item(data: PantryItemCreate):
    # Pydantic already parsed all fields; just check name isn't blank after strip.
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    added_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO pantry_items (name, category, quantity, unit, expires_at, added_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (name, data.category, data.quantity, data.unit, data.expires_at, added_at),
    )
    conn.commit()
    conn.close()
    return {"id": cursor.lastrowid, "message": "Pantry item created successfully"}


# Route 3 – PUT /api/pantry/{item_id}
# data fields come in via PantryItemUpdate model — access them as data.field_name
@app.put("/api/pantry/{item_id}")
def update_pantry_item(item_id: int, data: PantryItemUpdate):
    conn = get_db()
    conn.execute(
        # The 5 SET fields map to the first 5 ?s; item_id maps to the WHERE ?.
        "UPDATE pantry_items SET name=?, category=?, quantity=?, unit=?, expires_at=? WHERE id=?",
        (data.name, data.category, data.quantity, data.unit, data.expires_at, item_id),
    )
    conn.commit()
    conn.close()
    return {"message": "Pantry item updated successfully"}


# Route 4 – DELETE /api/pantry/{item_id}
@app.delete("/api/pantry/{item_id}")
def delete_pantry_item(item_id: int):
    conn = get_db()
    conn.execute(
        # The DELETE SQL statement removes the item with the specified id.  
        "DELETE FROM pantry_items WHERE id=?",
        (item_id,)
    )
    conn.commit()
    conn.close()
    return {"message": "Pantry item deleted successfully"}
# ── Entry point ──────────────────────────────────────────────────────────────

# Run with: uvicorn app:app --reload --port 5000
# (init_db is called automatically via the lifespan handler above)
