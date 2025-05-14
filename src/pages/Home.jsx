import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [gameData, setGameData] = useState({
    zeroDawn: null,
    forbiddenWest: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const zeroDawnResponse = await fetch("http://localhost:5000/api/game/1151640");
        const zeroDawnData = await zeroDawnResponse.json();
        console.log(zeroDawnData);
        
        
        const forbiddenWestResponse =  await fetch("http://localhost:5000/api/game/2420110");
        const forbiddenWestData = await forbiddenWestResponse.json();
        setGameData({
          zeroDawn: zeroDawnData,
          forbiddenWest: forbiddenWestData,
          loading: false,
          error: null
        });
      } catch (error) {
        setGameData({
          zeroDawn: null,
          forbiddenWest: null,
          loading: false,
          error: "Не удалось загрузить данные о играх"
        });
      }
    };

    fetchGameData();
  }, []);

  if (gameData.loading) return <div className="loading">Загрузка...</div>;
  if (gameData.error) return <div className="error">{gameData.error}</div>;

  return (
    <div className="home-container">
      <h1>Horizon: Zero Dawn & Forbidden West</h1>
      
      {gameData.zeroDawn && (
        <section className="game-section">
          <div className="game-header">
            <img 
              src={gameData.zeroDawn.header_image} 
              alt={gameData.zeroDawn.name} 
              className="game-cover"
            />
            <div className="game-info">
              <h2>{gameData.zeroDawn.name}</h2>
              <p className="game-description">{gameData.zeroDawn.short_description}</p>
              
              <div className="game-meta">
                <div className="price">{gameData.zeroDawn.price_overview?.final_formatted || "$39.99"}</div>
                <div className="platforms">
                  {gameData.zeroDawn.platforms?.windows && <span>Windows</span>}
                  {gameData.zeroDawn.platforms?.mac && <span>Mac</span>}
                  {gameData.zeroDawn.platforms?.linux && <span>Linux</span>}
                </div>
              </div>
            </div>
          </div>

          {gameData.zeroDawn.movies && gameData.zeroDawn.movies.length > 0 && (
            <div className="trailers">
              <h3>Трейлеры</h3>
              <div className="trailer-list">
                {gameData.zeroDawn.movies.slice(0, 2).map(movie => (
                  <video key={movie.id} controls className="trailer">
                    <source src={movie.webm[480]} type="video/webm" />
                    Ваш браузер не поддерживает видео тег.
                  </video>
                ))}
              </div>
            </div>
          )}

          <div className="requirements">
          <h3>Системные требования</h3>
          <div className="requirements-grid">
            <div className="requirement-block">
              <h4>Минимальные</h4>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.zeroDawn.pc_requirements?.minimum || "Информация недоступна" }} 
              />
            </div>
            <div className="requirement-block">
              <h4>Рекомендуемые</h4>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.zeroDawn.pc_requirements?.recommended || "Информация недоступна" }} 
              />
            </div>
          </div>
</div>
        </section>
      )}
      
      {gameData.forbiddenWest && (
        <section className="game-section">
          <div className="game-header">
            <img 
              src={gameData.forbiddenWest.header_image} 
              alt={gameData.forbiddenWest.name} 
              className="game-cover"
            />
            <div className="game-info">
              <h2>{gameData.forbiddenWest.name}</h2>
              <p className="game-description">{gameData.forbiddenWest.short_description}</p>
              
              <div className="game-meta">
                <div className="price">{gameData.forbiddenWest.price || "$59.99"}</div>
                <div className="platforms">
                  {gameData.forbiddenWest.platforms?.windows && <span>Windows</span>}
                  {gameData.forbiddenWest.platforms?.mac && <span>Mac</span>}
                  {gameData.forbiddenWest.platforms?.linux && <span>Linux</span>}
                </div>
              </div>
            </div>
          </div>

          {gameData.forbiddenWest.movies && gameData.forbiddenWest.movies.length > 0 && (
            <div className="trailers">
              <h3>Трейлеры</h3>
              <div className="trailer-list">
                {gameData.forbiddenWest.movies.slice(0, 2).map(movie => (
                  <video key={movie.id} controls className="trailer">
                    <source src={movie.webm[480]} type="video/webm" />
                    Ваш браузер не поддерживает видео тег.
                  </video>
                ))}
              </div>
            </div>
          )}

          <div className="requirements">
            <h3>Системные требования</h3>
            <div className="requirements-grid">
              <div className="requirement-block">
                <h4>Минимальные</h4>
                <div 
                  dangerouslySetInnerHTML={{ __html: gameData.zeroDawn.pc_requirements?.minimum || "Информация недоступна" }} 
                />
              </div>
              <div className="requirement-block">
                <h4>Рекомендуемые</h4>
                <div 
                  dangerouslySetInnerHTML={{ __html: gameData.zeroDawn.pc_requirements?.recommended || "Информация недоступна" }} 
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="character-link-container">
        <p>
          Вы играете за <Link to="/heroine" className="character-link">Элой</Link> — охотницу, раскрывающую тайны прошлого.
        </p>
      </div>
    </div>
  );
}