import React from 'react';
import './StatsCards.css';

const StatsCards = ({ productos, estadoFilter, onFilterChange }) => {
    const totalProductos = productos.length;
    const activos = productos.filter(p => p.estado === 'Activo').length;
    const inactivos = productos.filter(p => p.estado === 'Inactivo').length;
    const stockBajo = productos.filter(p => parseInt(p.stock) < 5).length;

    const cards = [
        {
            id: 'todos',
            icon: 'fa-boxes',
            label: 'Total Productos',
            value: totalProductos,
            color: 'primary',
        },
        {
            id: 'Activo',
            icon: 'fa-check-circle',
            label: 'Activos',
            value: activos,
            color: 'success',
        },
        {
            id: 'Inactivo',
            icon: 'fa-times-circle',
            label: 'Inactivos',
            value: inactivos,
            color: 'danger',
        },
        {
            id: 'bajo-stock',
            icon: 'fa-exclamation-triangle',
            label: 'Stock Bajo',
            value: stockBajo,
            color: 'warning',
        },
    ];

    return (
        <div className="stats-cards">
            {cards.map((card) => (
                <div
                    key={card.id}
                    className={`stat-card stat-${card.color} ${
                        estadoFilter === card.id ? 'active' : ''
                    }`}
                    onClick={() => onFilterChange(card.id)}
                >
                    <div className="stat-icon">
                        <i className={`fas ${card.icon}`}></i>
                    </div>
                    <div className="stat-content">
                        <h3>{card.value}</h3>
                        <p>{card.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
