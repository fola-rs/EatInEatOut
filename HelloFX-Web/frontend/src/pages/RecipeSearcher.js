import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function RecipeSearcher() {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  async function handlePredict() {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", selectedFile);
      const res = await fetch(`${API}/predict`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">
        Recipe Searcher
        <br />
        <span style={{ fontSize: "0.95rem", fontWeight: "normal", color: "#555" }}>
          Import an image of food — find recipes based on your ingredients
        </span>
      </h1>

      {/* Upload area */}
      <label className="upload-area" onClick={() => inputRef.current.click()}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <>
            <span style={{ fontSize: 48, color: "#2196f3" }}>+</span>
            <span style={{ color: "#555" }}>Click to select a food image</span>
          </>
        )}
      </label>

      {selectedFile && (
        <button
          className="btn btn-blue"
          style={{ marginTop: 16 }}
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? "Analysing…" : "Identify Food"}
        </button>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginTop: 16, maxWidth: 500, width: "100%" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="prediction-result" style={{ marginTop: 20 }}>
          <h3>Detected: {result.label}</h3>
          <p style={{ color: "#555", marginTop: 4 }}>
            Confidence: {result.confidence}%
          </p>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          {result.note && (
            <p style={{ marginTop: 10, fontSize: "0.8rem", color: "#999" }}>
              Note: {result.note}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <Link to="/" className="btn btn-grey">Back to Main Menu</Link>
      </div>
    </div>
  );
}
