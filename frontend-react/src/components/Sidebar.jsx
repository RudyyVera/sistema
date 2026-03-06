import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, onChangeView }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Actualizar clase CSS para transiciones puras y notificar cambio de ancho
    useEffect(() => {
        const sidebarEl = document.querySelector('.sidebar');
        const root = document.documentElement;
        if (sidebarEl) {
            if (isCollapsed) {
                sidebarEl.classList.add('collapsed');
                // Actualizar variable CSS para que Dashboard se ajuste en tiempo real
                root.style.setProperty('--active-sidebar-width', '80px');
            } else {
                sidebarEl.classList.remove('collapsed');
                root.style.setProperty('--active-sidebar-width', '280px');
            }
        }
    }, [isCollapsed]);

    const menuItems = [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
        { id: 'productos', icon: 'fa-boxes', label: 'Productos' },
        { id: 'movimientos', icon: 'fa-exchange-alt', label: 'Movimientos' },
        { id: 'reportes', icon: 'fa-chart-bar', label: 'Reportes' },
    ];

    const handleMenuClick = (itemId) => {
        onChangeView(itemId);
        if (isMobile) {
            setIsMobileOpen(false);
        }
    };

    return (
        <>
            {/* Botón Hamburguesa para Mobile */}
            {isMobile && (
                <button 
                    className="sidebar-mobile-toggle"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle menu"
                >
                    <i className={`fas ${isMobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            )}

            {/* Overlay para cerrar el sidebar en mobile */}
            {isMobile && isMobileOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${
                isCollapsed ? 'collapsed' : ''
            } ${
                isMobile && isMobileOpen ? 'mobile-open' : ''
            } ${
                isMobile && !isMobileOpen ? 'mobile-hidden' : ''
            }`}>
                {/* Header con Logo y Toggle */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <i className="fas fa-boxes"></i>
                    </div>
                    {!isCollapsed && (
                        <div className="sidebar-brand">
                            <h2>Stocklin</h2>
                            <p>Sistema de Inventario</p>
                        </div>
                    )}
                    
                    {/* Botón de Colapsar (solo desktop) */}
                    {!isMobile && (
                        <button 
                            className="sidebar-toggle"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                        >
                            <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
                        </button>
                    )}
                </div>

                {/* Menú de Navegación */}
                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <div 
                            key={item.id}
                            className="sidebar-menu-item-wrapper"
                            data-tooltip={isCollapsed ? item.label : ''}
                        >
                            <button
                                className={`sidebar-menu-item ${
                                    currentView === item.id ? 'active' : ''
                                }`}
                                onClick={() => handleMenuClick(item.id)}
                            >
                                <i className={`fas ${item.icon}`}></i>
                                {!isCollapsed && <span>{item.label}</span>}
                                {currentView === item.id && <div className="active-indicator"></div>}
                            </button>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {!isCollapsed && (
                        <>
                            <p>Stocklin</p>
                            <p>© 2026</p>
                        </>
                    )}
                    {isCollapsed && (
                        <div className="sidebar-footer-collapsed">
                            <i className="fas fa-info-circle"></i>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
