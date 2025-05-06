const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // для обработки JSON в теле запроса

const YANDEX_TRANSLATE_API_KEY = 'ajesdn4r8rqd707ddr8o';

// Функция для перевода текста через Yandex.Translate
async function translateText(text, targetLang = 'en') {
  const url = 'https://translate.api.cloud.yandex.net/translate/v2/translate';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${YANDEX_TRANSLATE_API_KEY}`,
    },
    body: JSON.stringify({
      folder_id: 'ваш_folder_id', 
      texts: [text],
      targetLanguageCode: targetLang,
    }),
  });

  if (!response.ok) {
    throw new Error(`Yandex Translate Error: ${response.status}`);
  }

  const data = await response.json();
  return data.translations[0].text;
}

// Эндпоинт для перевода достижений
app.post('/api/translate', async (req, res) => {
  const { text, lang } = req.body;

  if (!text || !lang) {
    return res.status(400).json({ error: 'Missing text or lang parameter' });
  }

  try {
    const translatedText = await translateText(text, lang);
    res.json({ translation: translatedText });
  } catch (err) {
    console.error('💥 Translation error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});
app.get("/api/achievements", async (req, res) => {
    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const APP_ID = "1151640";
  
    try {
        const response = await fetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${API_KEY}&appid=${APP_ID}`);
  
        if (!response.ok) {
            return res.status(response.status).json({ error: "Steam API error" });
        }
  
        const data = await response.json();
        const achievements = data?.game?.availableGameStats?.achievements;

        if (!achievements) {
            return res.status(404).json({ error: "Achievements not found" });
        }

        // Добавляем дополнительные данные для некоторых достижений
        const enhancedAchievements = achievements.map(ach => {
          const enhanced = { ...ach };
          
          // Пример добавления руководства для конкретных достижений
          if (ach.name === "ACHIEVEMENT_1") {
            enhanced.guideText = "Убейте 10 машин, чтобы получить это достижение.";
            enhanced.videoUrl = "https://youtube.com/watch?v=пример";
          }
          else if (ach.name === "ACHIEVEMENT_2") {
            enhanced.guideText = "Пройти основную сюжетную линию до конца.";
          }
          
          return enhanced;
        });

        res.json(enhancedAchievements);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});