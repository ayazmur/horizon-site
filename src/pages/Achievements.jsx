import React, { useState, useEffect, useContext } from "react";
import "./Achievements.css";
import { LanguageContext } from "../LanguageContext";

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const { language } = useContext(LanguageContext);
    const [user, setUser] = useState(null);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [showMockButton, setShowMockButton] = useState(false);
    useEffect(() => {
        // Проверяем, авторизован ли пользователь
        fetch("http://localhost:5000/auth/current_user", {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                    loadAchievements();
                } else {
                    setLoading(false);
                }
            })
            .catch(err => {
                setLoading(false);
            });
    }, []);

    const loadAchievements = () => {
        fetch("http://localhost:5000/api/user/achievements", {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error("Ошибка при загрузке данных");
                return res.json();
            })
            .then(data => {
                setAchievements(data);
                setLoading(false);
            })
            .catch(err => {
                setError("Не удалось загрузить достижения");
                setLoading(false);
            });
    };

    const loadFriends = () => {
    setFriendsLoading(true);
    fetch("http://localhost:5000/api/friends/achievements", {
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) throw new Error("Ошибка при загрузке друзей");
            return res.json();
        })
        .then(data => {
            const filtered = data.filter(friend => !friend.error);
            setFriends(filtered);
            setFriendsLoading(false);
            if (filtered.length === 0) {
                setShowMockButton(true);
            }
        })
        .catch(err => {
            console.error("Не удалось загрузить друзей", err);
            setFriendsLoading(false);
        });
};
    const loadMockFriends = () => {
    setFriendsLoading(true);
    fetch("http://localhost:5000/api/friends/mocks")
        .then(res => res.json())
        .then(data => {
            setFriends(data);
            setFriendsLoading(false);
            setShowMockButton(false);
        })
        .catch(err => {
            console.error("Ошибка при загрузке моковых друзей", err);
            setFriendsLoading(false);
        });
};

    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/steam";
    };

    const handleLogout = () => {
        fetch("http://localhost:5000/auth/logout", {
            credentials: 'include'
        })
            .then(() => {
                setUser(null);
                setAchievements([]);
                setFriends([]);
                setCompareMode(false);
            });
    };

    const toggleCompareMode = () => {
        if (!compareMode && friends.length === 0) {
            loadFriends();
        }
        setCompareMode(!compareMode);
        if (compareMode) {
            setSelectedFriend(null);
        }
    };

    if (loading) return <p>{language === 'ru' ? 'Загрузка...' : 'Loading...'}</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="achievements">
            <div className="user-panel">
                {user ? (
                    <div className="user-info">
                        <img src={user.photos[2].value} alt="Avatar" className="user-avatar" />
                        <span>{user.displayName}</span>
                        <button onClick={handleLogout} className="logout-button">
                            {language === 'ru' ? 'Выйти' : 'Logout'}
                        </button>
                        <button onClick={toggleCompareMode} className="compare-button">
                            {compareMode 
                                ? (language === 'ru' ? 'Закрыть сравнение' : 'Close comparison') 
                                : (language === 'ru' ? 'Сравнить с друзьями' : 'Compare with friends')}
                        </button>
                    </div>
                ) : (
                    <button onClick={handleLogin} className="steam-login-button">
                        {language === 'ru' ? 'Войти через Steam' : 'Login with Steam'}
                    </button>
                )}
            </div>

            <h2>{language === 'ru' ? 'Достижения Horizon Zero Dawn' : 'Horizon Zero Dawn Achievements'}</h2>
            
            {compareMode && (
    <div className="friends-section">
        {friendsLoading ? (
            <p>{language === 'ru' ? 'Загрузка списка друзей...' : 'Loading friends list...'}</p>
        ) : friends.length > 0 ? (
            <div className="friends-selector">
                <select 
                    onChange={(e) => setSelectedFriend(e.target.value)}
                    value={selectedFriend || ""}
                >
                    <option value="">{language === 'ru' ? 'Выберите друга' : 'Select a friend'}</option>
                    {friends.map(friend => (
                        <option key={friend.id} value={friend.id}>
                            {friend.name}
                        </option>
                    ))}
                </select>
                
                {selectedFriend && (
                    <div className="selected-friend-info">
                        <img 
                            src={friends.find(f => f.id === selectedFriend)?.avatar} 
                            alt="Friend avatar" 
                            className="friend-avatar" 
                        />
                        <span>{friends.find(f => f.id === selectedFriend)?.name}</span>
                        <a 
                            href={friends.find(f => f.id === selectedFriend)?.profileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="friend-profile-link"
                        >
                            {language === 'ru' ? 'Профиль Steam' : 'Steam Profile'}
                        </a>
                    </div>
                )}
            </div>
        ) : (
            <>
                <p>{language === 'ru'
                    ? 'У вас нет друзей в Steam или они не играли в эту игру'
                    : 'You have no Steam friends or they haven’t played this game'}
                </p>

                {showMockButton && (
                    <button
                        onClick={loadMockFriends}
                        className="steam-login-button"
                        style={{ marginTop: "1rem" }}
                    >
                        {language === 'ru' ? 'Загрузить пример друзей' : 'Load mock friends'}
                    </button>
                )}
            </>
        )}
    </div>
)}

            <ul className="achievements-list">
                {achievements.map(ach => (
                    <li 
                        key={ach.name} 
                        className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
                        onClick={() => setSelectedAchievement(ach)}
                    >
                        <img src={ach.icon} alt={ach.displayName} className="achievement-icon" />
                        <div className="achievement-info">
                            <strong>{ach.displayName}</strong>
                            <p>{ach.description}</p>
                            {ach.unlocked && (
                                <p className="unlocked-text">
                                    {language === 'ru' ? 'Получено' : 'Unlocked'}
                                </p>
                            )}
                            {compareMode && selectedFriend && (
                                <p className="friend-status">
                                    {friends.find(f => f.id === selectedFriend)?.achievements[ach.name]
                                        ? (language === 'ru' ? 'Друг получил' : 'Friend has it')
                                        : (language === 'ru' ? 'Друг не получил' : "Friend doesn't have it")}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Модальное окно */}
            {selectedAchievement && (
                <div className="modal-overlay" onClick={() => setSelectedAchievement(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                            
                            {selectedAchievement.guideText && (
                                <div className="achievement-guide">
                                    <h4>Как выполнить:</h4>
                                    <p>{selectedAchievement.guideText}</p>
                                </div>
                            )}
                            
                            {selectedAchievement.videoUrl && (
                                <div className="video-guide">
                                    <a 
                                        href={selectedAchievement.videoUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        Видео-гайд
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;