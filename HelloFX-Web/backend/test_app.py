# What this file is:
# A smoke test for the FastAPI backend. Uses FastAPI's built-in TestClient
# which simulates HTTP requests without starting a real server.
# "Smoke test" = turn it on, see if it explodes. That's it for now.

from fastapi.testclient import TestClient
from app import app  # imports the FastAPI app object from app.py

# TestClient wraps the app and lets you call routes like a browser would,
# but all in memory — no network, no real server needed.
client = TestClient(app)


def test_get_pantry_returns_list():
    # Make a GET request to /api/pantry
    response = client.get("/api/pantry")

    # 200 means the route exists and responded successfully
    assert response.status_code == 200

    # The response body should be a JSON array (list), even if empty
    assert isinstance(response.json(), list)


def test_health_check():
    # FastAPI's automatic /docs route existing means the app loaded correctly
    response = client.get("/docs")
    assert response.status_code == 200
