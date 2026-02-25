import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = ({ user, onLogout, searchTerm, onSearchChange, onScanClick }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        // Cargar desde localStorage
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const menuRef = useRef(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Aplicar cambios de tema al body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            // Agregar transición suave
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        }
        // Guardar en localStorage
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
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
                <div className="user-info">
                    <span className="user-name">{user?.nombre || user?.username}</span>
                    <span className="user-role">{user?.rol || 'Administrador'}</span>
                </div>

                {/* Avatar con dropdown */}
                <div className="user-menu-container" ref={menuRef}>
                    <button
                        className="user-avatar-button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        title="Menú de usuario"
                    >
                        <i className="fas fa-user"></i>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="user-dropdown-menu">
                            {/* Configuración */}
                            <button className="dropdown-item">
                                <i className="fas fa-cog"></i>
                                <span>Configuración</span>
                            </button>

                            {/* Separador */}
                            <div className="dropdown-divider"></div>

                            {/* Modo Oscuro */}
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

                            {/* Separador */}
                            <div className="dropdown-divider"></div>

                            {/* Cerrar Sesión */}
                            <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
