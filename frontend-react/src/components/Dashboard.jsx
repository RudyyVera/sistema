import React, { useMemo, useState, useEffect } from 'react';
import { obtenerProductos, obtenerDashboardStats, obtenerMovimientos } from '../config/api';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from './DashboardView';
import ProductsView from './ProductsView';
import MovementsView from './MovementsView';
import Reports from './Reports';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');
    const [estadoFilter, setEstadoFilter] = useState('todos');
    const [alert, setAlert] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const alertasStockBajo = productos.filter((p) => parseInt(p.stock, 10) < 5);

    useEffect(() => {
        cargarProductos();
        cargarDashboardData();
        cargarMovimientos();
    }, []);

    useEffect(() => {
        const polling = setInterval(() => {
            if (currentView === 'dashboard') {
                cargarProductos();
                cargarDashboardData();
                cargarMovimientos();
            }
        }, 15000);

        return () => clearInterval(polling);
    }, [currentView]);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const data = await obtenerProductos();
            // El backend devuelve directamente el array de productos
            if (Array.isArray(data)) {
                setProductos(data);
            } else {
                setProductos([]);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                mostrarAlerta('⚠️ Backend desconectado. Verifica que esté corriendo en http://localhost:5000', 'error');
            } else {
                mostrarAlerta('Error al cargar productos', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const cargarDashboardData = async () => {
        try {
            const data = await obtenerDashboardStats();
            setDashboardData(data);
        } catch (error) {
            console.error('Error al cargar dashboard stats:', error);
        }
    };

    const cargarMovimientos = async () => {
        try {
            const data = await obtenerMovimientos();
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            setMovimientos([]);
        }
    };

    const filteredProductos = useMemo(() => {
        const normalize = (value) => String(value || '').toLowerCase();
        const query = normalize(searchTerm).trim();

        let filtered = productos;

        if (query) {
            filtered = filtered.filter((p) => (
                normalize(p.nombre).includes(query) ||
                normalize(p.dni).includes(query) ||
                normalize(p.plan).includes(query)
            ));
        }

        if (estadoFilter === 'bajo-stock') {
            filtered = filtered.filter((p) => Number.parseInt(p.stock, 10) < 5);
        } else if (estadoFilter !== 'todos') {
            filtered = filtered.filter((p) => p.estado === estadoFilter);
        }

        return filtered;
    }, [productos, searchTerm, estadoFilter]);

    const mostrarAlerta = (mensaje, tipo = 'success') => {
        setAlert({ mensaje, tipo });
        setTimeout(() => setAlert(null), 3000);
    };

    const refrescarProductosYDashboard = async () => {
        await Promise.all([cargarProductos(), cargarDashboardData()]);
    };

    const handleProductUpdated = async () => {
        await refrescarProductosYDashboard();
        mostrarAlerta('Producto actualizado correctamente', 'success');
    };

    const handleProductDeleted = async () => {
        await refrescarProductosYDashboard();
        mostrarAlerta('Producto eliminado correctamente', 'success');
    };

    const handleProductCreated = async () => {
        await refrescarProductosYDashboard();
        mostrarAlerta('Producto registrado correctamente', 'success');
    };

    const handleMovementSaved = async () => {
        await Promise.all([cargarProductos(), cargarDashboardData(), cargarMovimientos()]);
        mostrarAlerta('Movimiento registrado correctamente', 'success');
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar 
                currentView={currentView}
                onChangeView={setCurrentView}
            />
            
            <div className="dashboard-main">
                <Header 
                    user={user}
                    onLogout={onLogout}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    alertas={alertasStockBajo}
                />

                {currentView === 'dashboard' && (
                    <div className="dashboard-content">
                        <DashboardView
                            productos={productos}
                            dashboardData={dashboardData}
                            movimientos={movimientos}
                        />
                    </div>
                )}

                {currentView === 'productos' && (
                    <div className="dashboard-content">
                        <ProductsView
                            productos={filteredProductos}
                            allProductos={productos}
                            onProductUpdated={handleProductUpdated}
                            onProductDeleted={handleProductDeleted}
                            onProductCreated={handleProductCreated}
                            estadoFilter={estadoFilter}
                            onFilterChange={setEstadoFilter}
                        />
                    </div>
                )}

                {currentView === 'reportes' && (
                    <Reports productos={productos} />
                )}

                {currentView === 'movimientos' && (
                    <div className="dashboard-content">
                        <MovementsView
                            productos={productos}
                            movimientos={movimientos}
                            user={user}
                            onMovementSaved={handleMovementSaved}
                        />
                    </div>
                )}
            </div>

            {alert && (
                <div className={`alert alert-${alert.tipo}`}>
                    {alert.mensaje}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
