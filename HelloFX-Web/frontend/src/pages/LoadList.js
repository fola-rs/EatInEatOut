import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function LoadList() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchLists() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/lists`);
      if (!res.ok) throw new Error("Failed to fetch lists");
      setLists(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this list?")) return;
    await fetch(`${API}/lists/${id}`, { method: "DELETE" });
    fetchLists();
  }

  useEffect(() => { fetchLists(); }, []);

  return (
    <div className="page">
      <h1 className="page-title">Your Saved Lists</h1>

      <div className="table-card">
        {loading && <p>Loading…</p>}
        {error   && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && lists.length === 0 && (
          <p style={{ color: "#777" }}>No lists saved yet.</p>
        )}
        {!loading && !error && lists.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Content</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td style={{ whiteSpace: "pre-wrap", maxWidth: 320 }}>{item.content}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{item.created_at}</td>
                  <td>
                    <button
                      className="btn btn-red"
                      style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to="/" className="btn btn-grey">Back to Main Menu</Link>
      </div>
    </div>
  );
}
