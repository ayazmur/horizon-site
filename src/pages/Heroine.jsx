import React, { useContext } from "react";
import { LanguageContext } from "../LanguageContext";

export default function Heroine() {
  const { language } = useContext(LanguageContext);

  return (
    <div>
      <h1>{language === 'ru' ? 'Элой — главная героиня' : 'Aloy — the main heroine'}</h1>
      <p>
        {language === 'ru' 
          ? 'Элой — сирота, воспитанная в племени Нора. Она решительна, умна и стремится узнать правду о мире и о себе. Её путь — это не только борьба за выживание, но и за истину.'
          : 'Aloy is an orphan raised by the Nora tribe. She is determined, intelligent, and seeks to uncover the truth about the world and herself. Her journey is not just about survival, but about truth.'}
      </p>
      <p>
        {language === 'ru'
          ? 'Сражаясь с механическими зверями и преодолевая опасности, она раскрывает тайны древнего мира и своего происхождения.'
          : 'Battling mechanical beasts and overcoming dangers, she uncovers the secrets of the ancient world and her own origins.'}
      </p>
      <img src="/ELOY.jpeg" alt={language === 'ru' ? 'Элой — главная героиня' : 'Aloy — the main heroine'} />
    </div>
  );
}