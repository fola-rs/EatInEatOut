import React, { useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function CreateList() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${API}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage({ type: "success", text: "List saved successfully!" });
      setTitle("");
      setContent("");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Create a New List</h1>

      <form className="form-card" onSubmit={handleSave}>
        <div>
          <label htmlFor="title">List Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Weekly Groceries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="content">List Items</label>
          <textarea
            id="content"
            placeholder="Enter your items here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-green">
            Save List
          </button>
          <Link to="/" className="btn btn-grey">
            Back to Main Menu
          </Link>
        </div>
      </form>
    </div>
  );
}
