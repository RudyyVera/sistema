import React, { useState } from 'react';
import ProductTable from './ProductTable';
import StatsCards from './StatsCards';
import './ProductsView.css';

const ProductsView = ({ 
    productos,
    allProductos,
    onProductUpdated, 
    onProductDeleted, 
    onProductCreated,
    estadoFilter,
    onFilterChange 
}) => {
    const [localFilter, setLocalFilter] = useState(estadoFilter);

    const handleFilterChange = (filter) => {
        setLocalFilter(filter);
        if (onFilterChange) {
            onFilterChange(filter);
        }
    };

    const statsProductos = allProductos || productos;

    return (
        <div className="products-view">
            <div className="products-header">
                <div className="products-title">
                    <h2>
                        <i className="fas fa-box"></i>
                        Gestión de Productos
                    </h2>
                    <p>Administra tu inventario de productos</p>
                </div>
            </div>

            {/* Tarjetas de Estadísticas - REUTILIZADAS del Dashboard */}
            <StatsCards 
                productos={statsProductos} 
                estadoFilter={localFilter}
                onFilterChange={handleFilterChange}
            />

            {/* Tabla de Productos */}
            <div className="products-table-container">
                <ProductTable
                    productos={productos}
                    onProductUpdated={onProductUpdated}
                    onProductDeleted={onProductDeleted}
                    onProductCreated={onProductCreated}
                />
            </div>
        </div>
    );
};

export default ProductsView;
