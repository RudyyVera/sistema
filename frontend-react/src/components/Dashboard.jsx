import React, { useState, useEffect } from 'react';
import { obtenerProductos } from '../config/api';
import Sidebar from './Sidebar';
import Header from './Header';
import ProductTable from './ProductTable';
import StatsCards from './StatsCards';
import Reports from './Reports';
import ScannerModal from './ScannerModal';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');
    const [estadoFilter, setEstadoFilter] = useState('todos');
    const [alert, setAlert] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        cargarProductos();
    }, []);

    useEffect(() => {
        filtrarProductos();
    }, [searchTerm, productos, estadoFilter]);

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

    const filtrarProductos = () => {
        let filtered = productos;

        // Filtro por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.plan.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por estado
        if (estadoFilter !== 'todos') {
            filtered = filtered.filter(p => p.estado === estadoFilter);
        }

        setFilteredProductos(filtered);
    };

    const mostrarAlerta = (mensaje, tipo = 'success') => {
        setAlert({ mensaje, tipo });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleProductUpdated = () => {
        cargarProductos();
        mostrarAlerta('Producto actualizado correctamente', 'success');
    };

    const handleProductDeleted = () => {
        cargarProductos();
        mostrarAlerta('Producto eliminado correctamente', 'success');
    };

    const handleProductCreated = () => {
        cargarProductos();
        mostrarAlerta('Producto registrado correctamente', 'success');
    };

    const handleScanDetected = (producto) => {
        setShowScanner(false);
        if (producto) {
            // Recargar productos para mostrar el nuevo
            cargarProductos();
            mostrarAlerta(`✅ Producto guardado: ${producto.dni}`, 'success');
        }
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
                    onScanClick={() => setShowScanner(true)}
                />

                {currentView === 'dashboard' && (
                    <div className="dashboard-content">
                        <StatsCards 
                            productos={productos}
                            estadoFilter={estadoFilter}
                            onFilterChange={setEstadoFilter}
                        />
                        <ProductTable
                            productos={filteredProductos}
                            onProductUpdated={handleProductUpdated}
                            onProductDeleted={handleProductDeleted}
                            onProductCreated={handleProductCreated}
                        />
                    </div>
                )}

                {currentView === 'reportes' && (
                    <Reports productos={productos} />
                )}
            </div>

            {alert && (
                <div className={`alert alert-${alert.tipo}`}>
                    {alert.mensaje}
                </div>
            )}

            {/* Botón Flotante (FAB) para escanear */}
            <button 
                className="fab-scan-button"
                onClick={() => setShowScanner(true)}
                title="Escanear producto"
            >
                <i className="fas fa-camera"></i>
            </button>

            {showScanner && (
                <ScannerModal
                    onClose={() => setShowScanner(false)}
                    onDetected={handleScanDetected}
                />
            )}
        </div>
    );
};

export default Dashboard;
