import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <h1 className="page-title">
        Welcome to GroceryNotes
        <br />
        <span style={{ fontSize: "1rem", fontWeight: "normal", color: "#555" }}>
          Your Smart Shopping Assistant
        </span>
      </h1>

      <div className="nav-buttons">
        <Link to="/create" className="btn btn-green" style={{ textAlign: "center" }}>
          Create List
        </Link>
        <Link to="/load" className="btn btn-blue" style={{ textAlign: "center" }}>
          Load List
        </Link>
        <Link to="/recipes" className="btn btn-orange" style={{ textAlign: "center" }}>
          Recipe Searcher
        </Link>
      </div>
    </div>
  );
}
