const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/api/achievements", async (req, res) => {
    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const APP_ID = "1151640";
  
    try {
        console.log("⚙️ Отправка запроса к Steam API...");
        const response = await fetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${API_KEY}&appid=${APP_ID}`);
  
        if (!response.ok) {
            console.error("Steam API Error Status:", response.status);
            const text = await response.text();  // получаем тело ответа
            console.error("Steam API Error Body:", text);  // выводим тело ошибки
            return res.status(response.status).json({ error: "Steam API error" });
        }
  
        const data = await response.json();
        console.log("✅ JSON успешно распарсен");

        const achievements = data?.game?.availableGameStats?.achievements;

        if (!achievements) {
            console.log("❌ Достижения не найдены в структуре ответа");
            return res.status(404).json({ error: "Achievements not found" });
        }

        res.json(achievements);
    } catch (err) {
        console.error("💥 Ошибка при обработке запроса:", err); 
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер работает на http://localhost:${PORT}`);
});
