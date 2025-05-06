import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Heroine from "./pages/Heroine";
import Achievements from "./pages/Achievements";
import Robots from "./pages/Robots";
import { LanguageContext } from "./LanguageContext";

export default function App() {
  const { language, toggleLanguage } = useContext(LanguageContext);

  return (
    <Router>
      <nav>
        <div className="logo"><img src="Site-logo.webp" alt="" /></div>
        <div>
          <Link to="/">{language === 'ru' ? 'Главная' : 'Home'}</Link>
          <Link to="/heroine">{language === 'ru' ? 'Герои' : 'Heroes'}</Link>
          <Link to="/robots">{language === 'ru' ? 'Роботы' : 'Robots'}</Link>
          <Link to="/achievements">{language === 'ru' ? 'Достижения' : 'Achievements'}</Link>
          <button onClick={toggleLanguage} className="language-toggle">
            {language === 'ru' ? 'EN' : 'RU'}
          </button>
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