const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

const app = express();
const PORT = 5000;

// Конфигурация сессий
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Настройка Steam стратегии
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:5000/auth/steam/return',
    realm: 'http://localhost:5000/',
    apiKey: '699DDC06199E5195CFEDF670B8AB9586'
}, (identifier, profile, done) => {
    profile.identifier = identifier;
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Аутентификация
app.get('/auth/steam', passport.authenticate('steam'));
app.get('/auth/steam/return', 
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('http://localhost:3000/achievements');
    }
);

app.get('/auth/current_user', (req, res) => {
    if (req.user) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('http://localhost:3000');
});

// Получение достижений пользователя
app.get("/api/user/achievements", async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const APP_ID = "1151640";
    const STEAM_ID = req.user.id;

    try {
        const userAchievements = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${API_KEY}&steamid=${STEAM_ID}&appid=${APP_ID}`
        );

        const schemaResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${API_KEY}&appid=${APP_ID}`
        );

        if (!userAchievements.ok || !schemaResponse.ok) {
            return res.status(500).json({ error: "Steam API error" });
        }

        const userData = await userAchievements.json();
        const schemaData = await schemaResponse.json();

        const achievements = schemaData?.game?.availableGameStats?.achievements;
        const playerAchievements = userData?.playerstats?.achievements;

        if (!achievements || !playerAchievements) {
            return res.status(404).json({ error: "Achievements not found" });
        }

        const mergedAchievements = achievements.map(ach => {
            const playerAch = playerAchievements.find(a => a.apiname === ach.name);
            return {
                ...ach,
                unlocked: playerAch ? playerAch.achieved === 1 : false,
                unlockTime: playerAch ? playerAch.unlocktime : null,
                guideText: getGuideText(ach.name),
                videoUrl: getVideoUrl(ach.name)
            };
        });

        res.json(mergedAchievements);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Получение достижений всех друзей
app.get("/api/friends/achievements", async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const APP_ID = "1151640";
    const STEAM_ID = req.user.id;

    try {
        const friendsResponse = await fetch(
            `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${API_KEY}&steamid=${STEAM_ID}&relationship=friend`
        );

        if (!friendsResponse.ok) {
            return res.status(friendsResponse.status).json({ error: "Steam API error" });
        }

        const friendsData = await friendsResponse.json();
        const friendsList = friendsData.friendslist?.friends;

        if (!friendsList || friendsList.length === 0) {
            return res.json(getMockFriends());
        }

        const limitedFriends = friendsList.slice(0, 5);
        const steamIds = limitedFriends.map(f => f.steamid).join(',');

        const playerSummaries = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&steamids=${steamIds}`
        );

        if (!playerSummaries.ok) {
            return res.status(playerSummaries.status).json({ error: "Steam API error" });
        }

        const summariesData = await playerSummaries.json();
        const players = summariesData.response?.players;

        if (!players || players.length === 0) {
            return res.json(getMockFriends());
        }

        const friendsWithAchievements = await Promise.all(players.map(async player => {
            try {
                const achievementsResponse = await fetch(
                    `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${API_KEY}&steamid=${player.steamid}&appid=${APP_ID}`
                );

                if (!achievementsResponse.ok) {
                    return {
                        id: player.steamid,
                        name: player.personaname,
                        avatar: player.avatarfull,
                        achievements: {},
                        error: "Could not load achievements"
                    };
                }

                const achievementsData = await achievementsResponse.json();
                const playerAchievements = achievementsData?.playerstats?.achievements;

                const achievementsMap = {};
                if (playerAchievements) {
                    playerAchievements.forEach(ach => {
                        achievementsMap[ach.apiname] = ach.achieved === 1;
                    });
                }

                return {
                    id: player.steamid,
                    name: player.personaname,
                    avatar: player.avatarfull,
                    achievements: achievementsMap,
                    profileUrl: player.profileurl
                };
            } catch (err) {
                return {
                    id: player.steamid,
                    name: player.personaname,
                    avatar: player.avatarfull,
                    achievements: {},
                    error: "Error loading achievements"
                };
            }
        }));

        const validFriends = friendsWithAchievements.filter(f => !f.error);
        if (validFriends.length === 0) {
            return res.json(getMockFriends());
        }

        res.json(validFriends);
    } catch (err) {
        console.error("Steam API error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Получение списка друзей
app.get("/api/friends/list", async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const STEAM_ID = req.user.id;

    try {
        const friendsResponse = await fetch(
            `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${API_KEY}&steamid=${STEAM_ID}&relationship=friend`
        );

        if (!friendsResponse.ok) {
            return res.status(friendsResponse.status).json({ error: "Steam API error" });
        }

        const friendsData = await friendsResponse.json();
        const friendsList = friendsData.friendslist?.friends;

        if (!friendsList || friendsList.length === 0) {
            return res.json([]);
        }

        const steamIds = friendsList.map(f => f.steamid).join(',');
        const playerSummaries = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&steamids=${steamIds}`
        );

        if (!playerSummaries.ok) {
            return res.status(playerSummaries.status).json({ error: "Steam API error" });
        }

        const summariesData = await playerSummaries.json();
        const players = summariesData.response?.players;

        if (!players || players.length === 0) {
            return res.json([]);
        }

        const friendsInfo = players.map(player => ({
            id: player.steamid,
            name: player.personaname,
            avatar: player.avatarfull,
            profileUrl: player.profileurl,
            lastOnline: player.lastlogoff
        }));

        res.json(friendsInfo);
    } catch (err) {
        console.error("Steam API error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/api/friends/mocks", (req, res) => {
    return res.json(getMockFriends());
});
// Список всех достижений игры
app.get("/api/achievements", async (req, res) => {
    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const APP_ID = "1151640";

    try {
        const response = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${API_KEY}&appid=${APP_ID}`
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: "Steam API error" });
        }

        const data = await response.json();
        const achievements = data?.game?.availableGameStats?.achievements;

        if (!achievements) {
            return res.status(404).json({ error: "Achievements not found" });
        }

        const enhancedAchievements = achievements.map(ach => ({
            ...ach,
            guideText: getGuideText(ach.name),
            videoUrl: getVideoUrl(ach.name)
        }));

        res.json(enhancedAchievements);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Хелперы
function getGuideText(achievementName) {
    const guides = {
        "ACH_WELCOME": "Начните игру, чтобы получить это достижение",
        "ACH_MAIN_STORY": "Завершите основную сюжетную линию",
        "ACH_ALL_MACHINES": "Победите все типы машин в игре"
    };
    return guides[achievementName] || null;
}

function getVideoUrl(achievementName) {
    const videos = {
        "ACH_ALL_MACHINES": "https://youtu.be/example1",
        "ACH_HARD_MODE": "https://youtu.be/example2"
    };
    return videos[achievementName] || null;
}

function getMockFriends() {
    return [
        {
            id: '76561198000000001',
            name: 'Друг 1',
            avatar: 'https://via.placeholder.com/64',
            achievements: {
                "ACH_WELCOME": true,
                "ACH_MAIN_STORY": false,
                "ACH_ALL_MACHINES": true
            },
            profileUrl: 'https://steamcommunity.com/id/mockfriend1'
        },
        {
            id: '76561198000000002',
            name: 'Друг 2',
            avatar: 'https://via.placeholder.com/64',
            achievements: {
                "ACH_WELCOME": true,
                "ACH_MAIN_STORY": true,
                "ACH_ALL_MACHINES": false
            },
            profileUrl: 'https://steamcommunity.com/id/mockfriend2'
        }
    ];
}
app.get("/api/game/:appid", async (req, res) => {
    const API_KEY = "699DDC06199E5195CFEDF670B8AB9586";
    const APP_ID = req.params.appid;

    try {
        const response = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${APP_ID}&cc=us&l=english`
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: "Steam API error" });
        }

        const data = await response.json();
        const gameData = data[APP_ID]?.data;

        if (!gameData) {
            return res.status(404).json({ error: "Game not found" });
        }

        // Форматируем данные для удобства
        const result = {
            name: gameData.name,
            short_description: gameData.short_description,
            header_image: gameData.header_image,
            movies: gameData.movies || [],
            price_overview: gameData.price_overview,
            platforms: gameData.platforms,
            pc_requirements: gameData.pc_requirements
        };

        res.json(result);
    } catch (err) {
        console.error("Steam API error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер работает на http://localhost:${PORT}`);
});
