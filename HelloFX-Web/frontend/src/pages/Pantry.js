import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "produce",
    quantity: 1,
    unit: "",
    expires_at: "",
  });

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/pantry`);
      if (!res.ok) throw new Error("Failed to fetch pantry");
      setItems(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  async function addItem() {
    await fetch(`${API}/pantry`, {
      method: "POST",                                    // POST = create new data (GET = read, POST = create, PUT = update, DELETE = remove)
      headers: { "Content-Type": "application/json" },  // tells the backend the body is JSON text, not a file or HTML form
      body: JSON.stringify(form),                        // JSON.stringify converts the form object → a JSON string the backend can parse
    });
    fetchItems();                                        // re-fetch the list so the new item appears in the table immediately
    setForm({ name: "", category: "produce", quantity: 1, unit: "", expires_at: "" }); // reset all fields to defaults after saving
  }

  return (
    <div className="page">
      <h1 className="page-title">My Pantry</h1>

      {/* ── Add-item form ── */}
      <div style={{ marginBottom: 24 }}>
        <h2>Add Item</h2>

        {/* value= makes this a "controlled" input — React state is the source of truth, not the DOM */}
        {/* onChange= fires on every keystroke; e.target.value is whatever the user just typed */}
        <input
          placeholder="Name (required)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* <select> is controlled the same way as <input> — value= and onChange= */}
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
          <option value="meat and fish">Meat and Fish</option>
          <option value="dry goods">Dry Goods</option>
          <option value="frozen">Frozen</option>
          <option value="condiments">Condiments</option>
          <option value="snacks">Snacks</option>
          <option value="other">Other</option>
        </select>

        {/* type="number" shows a numeric keyboard on mobile */}
        {/* Number() converts the string "6" from e.target.value into the actual number 6 */}
        <input
          type="number"
          min="0"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
        />

        {/* empty string value "" means no unit — just a count */}
        <select
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        >
          <option value="">— (count)</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="tbsp">tbsp</option>
          <option value="tsp">tsp</option>
          <option value="cup">cup</option>
        </select>

        {/* type="date" renders a browser date picker; value is stored as a "YYYY-MM-DD" string */}
        <input
          type="date"
          value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
        />

        {/* onClick receives the function reference — addItem runs when the button is clicked */}
        <button onClick={addItem}>Add to Pantry</button>
      </div>

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
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.expires_at ?? "—"}</td>
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
