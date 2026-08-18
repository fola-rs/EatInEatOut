# What this file is:
# A smoke test for the FastAPI backend. Uses FastAPI's built-in TestClient
# which simulates HTTP requests without starting a real server.

from fastapi.testclient import TestClient
from app import app  # imports the FastAPI app object from app.py


def test_get_pantry_returns_list():
    # 'with TestClient(app) as client' triggers the app's lifespan —
    # that's what runs init_db() and creates the SQLite tables.
    # Without 'with', lifespan is skipped and the tables don't exist yet.
    with TestClient(app) as client:
        response = client.get("/api/pantry")

        # 200 means the route exists and responded successfully
        assert response.status_code == 200

        # The response body should be a JSON array (list), even if empty
        assert isinstance(response.json(), list)


def test_health_check():
    with TestClient(app) as client:
        # FastAPI's /docs route existing means the app loaded correctly
        response = client.get("/docs")
        assert response.status_code == 200
