import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/pantry`);         // TODO: which endpoint?
      if (!res.ok) throw new Error("Failed to fetch pantry");
      setItems(await res.json());
    } catch (err) {
      setError(err.message);                                 // TODO: what do you set error to?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);                     // TODO: call fetchItems on load

  return (
    <div className="page">
      <h1 className="page-title">My Pantry</h1>

      {loading && <p>Loading…</p>}
      {error   && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p style={{ color: "#777" }}>No items in your pantry yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>             {/* TODO: unique key */}
                <td>{item.name}</td>           {/* TODO: name */}
                <td>{item.category}</td>           {/* TODO: category */}
                <td>{item.quantity}</td>           {/* TODO: quantity */}
                <td>{item.unit}</td>           {/* TODO: unit */}
                <td>{item.expires_at ?? "—"}</td>    {/* TODO: expires_at, show dash if null */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 24 }}>
        <Link to="/" className="btn btn-grey">Back to Main Menu</Link>
      </div>
    </div>
  );
}
