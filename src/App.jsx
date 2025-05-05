import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Heroine from "./pages/Heroine";
import Achievements from "./pages/Achievements";
import Robots from "./pages/Robots";

export default function App() {
  return (
    <Router>
      <nav>
        <div className="logo">Horizon Games</div>
        <div>
          <Link to="/">Главная</Link>
          <Link to="/heroine">Герои</Link>
          <Link to="/robots">Роботы</Link>
          <Link to="/achievements">Достижения</Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/heroine" element={<Heroine />} />
          <Route path="/robots" element={<Robots />} />
          <Route path="/achievements" element={<Achievements />} />
        </Routes>
      </main>
    </Router>
  );
}
