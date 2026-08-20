# Smoke tests for the FastAPI backend using FastAPI's in-memory TestClient.

from fastapi.testclient import TestClient
from app import app


def test_get_pantry_returns_list():
    # 'with' starts the app, triggering lifespan/init_db() so pantry_items exists.
    with TestClient(app) as client:
        response = client.get("/api/pantry")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


def test_health_check():
    with TestClient(app) as client:
        response = client.get("/docs")
        assert response.status_code == 200
