import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = ({ user, onLogout, searchTerm, onSearchChange, alertas = [] }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const menuRef = useRef(null);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }

            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const applyTheme = (isDark) => {
            requestAnimationFrame(() => {
                if (isDark) {
                    document.documentElement.classList.add('dark-mode');
                    document.body.classList.add('dark-mode');
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    document.body.classList.remove('dark-mode');
                }
            });
            localStorage.setItem('darkMode', JSON.stringify(isDark));
        };

        applyTheme(darkMode);
    }, [darkMode]);

    const handleDarkModeToggle = () => {
        setDarkMode((prevDarkMode) => !prevDarkMode);
    };

    const handleLogout = () => {
        setShowUserMenu(false);
        onLogout();
    };

    return (
        <header className="header">
            <div className="header-search">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="header-user">
                <div className="notification-container" ref={notificationsRef}>
                    <button
                        className="header-notification"
                        type="button"
                        aria-label="Notificaciones"
                        onClick={() => setShowNotifications((prev) => !prev)}
                    >
                        <i className="fas fa-bell"></i>
                        <span className="notification-badge">{alertas.length > 0 ? alertas.length : 0}</span>
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <p className="notifications-title">Notificaciones</p>
                            {alertas.length === 0 ? (
                                <p className="notifications-empty">No hay notificaciones nuevas</p>
                            ) : (
                                <div className="notifications-list">
                                    {alertas.slice(0, 5).map((alerta) => (
                                        <div key={alerta.id} className="notification-item">
                                            <i className="fas fa-triangle-exclamation"></i>
                                            <div>
                                                <p>{alerta.nombre}</p>
                                                <span>Stock actual: {alerta.stock}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="header-admin-block">
                    <div className="user-info">
                        <span className="user-name">{user?.nombre || user?.username || 'Administrador'}</span>
                        <span className="user-role">{user?.rol || 'Admin'}</span>
                    </div>

                    <div className="user-menu-container" ref={menuRef}>
                        <button
                            className="user-avatar-button"
                            onClick={() => setShowUserMenu((prev) => !prev)}
                            title="Menu de usuario"
                        >
                            <i className="fas fa-user"></i>
                        </button>

                        {showUserMenu && (
                            <div className="user-dropdown-menu">
                                <button className="dropdown-item">
                                    <i className="fas fa-cog"></i>
                                    <span>Configuracion</span>
                                </button>

                                <div className="dropdown-divider"></div>

                                <div className="dropdown-item-toggle">
                                    <div className="toggle-label">
                                        <i className="fas fa-moon"></i>
                                        <span>Modo Oscuro</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={darkMode}
                                            onChange={handleDarkModeToggle}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="dropdown-divider"></div>

                                <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Cerrar Sesion</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
