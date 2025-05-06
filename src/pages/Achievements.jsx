import React, { useEffect, useState, useContext } from "react";
import "./Achievements.css";
import { LanguageContext } from "../LanguageContext";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const { language } = useContext(LanguageContext);

  // Закрытие модального окна при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        setSelectedAchievement(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Функция для открытия модального окна
  const openAchievementModal = (achievement) => {
    setSelectedAchievement(achievement);
  };

  // Остальной код загрузки достижений...

  return (
    <div className="achievements">
      <h2>{language === 'ru' ? 'Достижения Horizon Zero Dawn' : 'Horizon Zero Dawn Achievements'}</h2>
      <ul className="achievements-list">
        {achievements.map((ach) => (
          <li 
            key={ach.name} 
            className="achievement-card"
            onClick={() => openAchievementModal(ach)}
          >
            <img src={ach.icon} alt={ach.displayName} className="achievement-icon" />
            <div className="achievement-info">
              <strong>{ach.displayName}</strong>
              <p>{ach.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Модальное окно */}
      {selectedAchievement && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setSelectedAchievement(null)}
            >
              &times;
            </button>
            
            <div className="modal-header">
              <img 
                src={selectedAchievement.icon} 
                alt={selectedAchievement.displayName} 
                className="modal-icon"
              />
              <h3>{selectedAchievement.displayName}</h3>
            </div>
            
            <div className="modal-body">
              <p>{selectedAchievement.description}</p>
              
              {/* Дополнительная информация */}
              <div className="achievement-guide">
                <h4>{language === 'ru' ? 'Как выполнить:' : 'How to unlock:'}</h4>
                <p>
                  {selectedAchievement.guideText || 
                    (language === 'ru' 
                      ? 'Информация о выполнении этого достижения пока недоступна.' 
                      : 'Guide for this achievement is not available yet.')}
                </p>
                
                {/* Ссылка на видео */}
                {selectedAchievement.videoUrl && (
                  <div className="video-guide">
                    <a 
                      href={selectedAchievement.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {language === 'ru' ? 'Видео-гайд' : 'Video guide'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;