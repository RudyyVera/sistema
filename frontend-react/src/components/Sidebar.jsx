import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, onChangeView }) => {
    const menuItems = [
        { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
        { id: 'productos', icon: 'fa-box', label: 'Productos' },
        { id: 'reportes', icon: 'fa-file-alt', label: 'Reportes' },
        { id: 'exportar', icon: 'fa-download', label: 'Exportar' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <i className="fas fa-boxes"></i>
                </div>
                <h2>Stocklin</h2>
                <p>Sistema de Inventario</p>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-menu-item ${
                            currentView === item.id ? 'active' : ''
                        }`}
                        onClick={() => onChangeView(item.id)}
                    >
                        <i className={`fas ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p>Stocklin v1.0</p>
                <p>© 2026</p>
            </div>
        </div>
    );
};

export default Sidebar;
