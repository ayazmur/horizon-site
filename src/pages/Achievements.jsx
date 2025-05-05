import React, { useEffect, useState } from "react";
import "./Achievements.css"; 

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/achievements")
      .then((res) => {        
        if (!res.ok) throw new Error("Ошибка при загрузке данных с сервера");
        return res.json();
      })
      .then((data) => {
        setAchievements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки достижений:", err);
        setError("Не удалось загрузить достижения.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка достижений...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="achievements">
      <h2>Достижения Horizon Zero Dawn</h2>
      <ul className="achievements-list">
        {achievements.map((ach) => (
          <li key={ach.name} className="achievement-card">
            <img
              src={ach.icon}
              alt={ach.displayName}
              className="achievement-icon"
            />
            <div className="achievement-info">
              <strong>{ach.displayName}</strong>
              <p>{ach.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Achievements;
