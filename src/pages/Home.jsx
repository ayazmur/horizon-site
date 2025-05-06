import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Horizon: Zero Dawn & Forbidden West</h1>
      <section>
        <h2>Horizon Zero Dawn</h2>
        <p>
          Horizon Zero Dawn — игра с открытым миром в жанре Action/RPG, разработанная студией Guerrilla Games 
          и изданная Sony Interactive Entertainment для PlayStation 4 в 2017 году. Впервые игра была 
          официально представлена во время E3 2015. Это первый продукт компании в ролевом жанре.
        </p>
      </section>
      
      <section>
        <h2>Horizon Forbidden West</h2>
        <p>
          Продолжение Horizon Zero Dawn, выпущенное в 2022 году. Элой отправляется на запад, чтобы 
          исследовать новые земли, сталкиваясь с потрясающими пейзажами и ещё более опасными 
          механическими существами.
        </p>
      </section>

      <p>
        Вы играете за <Link to="/heroine" className="character-link">Элой</Link> — охотницу, раскрывающую тайны прошлого.
      </p>
      <img src="/logo.webp" alt="Game Art" />
    </div>
  );
}