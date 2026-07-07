import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateList from "./pages/CreateList";
import LoadList from "./pages/LoadList";
import Pantry from "./pages/Pantry";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateList />} />
        <Route path="/load" element={<LoadList />} />
        <Route path="/pantry" element={<Pantry />} />
      </Routes>
    </BrowserRouter>
  );
}
