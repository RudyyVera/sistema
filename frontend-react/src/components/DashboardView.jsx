import React, { useState, useEffect, memo, useMemo } from 'react';
import StatsCards from './StatsCards';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import './DashboardView.css';

const DashboardView = ({ productos }) => {
    // Estados para datos dinámicos de la API
    const [dashboardStats, setDashboardStats] = useState(null);
    const [tendenciaData, setTendenciaData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Productos con stock bajo (menos de 5)
    const stockBajo = productos.filter(p => parseInt(p.stock) < 5);
    
    // Productos por estado
    const activos = productos.filter(p => p.estado === 'Activo').length;
    const inactivos = productos.filter(p => p.estado === 'Inactivo').length;

    // Top 5 productos con menos stock
    const topStockBajo = [...productos]
        .sort((a, b) => parseInt(a.stock) - parseInt(b.stock))
        .slice(0, 5);

    // ==========================================
    // CARGAR DATOS DESDE API
    // ==========================================
    useEffect(() => {
        const cargarDashboardStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/dashboard/stats');
                
                if (!response.ok) {
                    throw new Error('Error al cargar estadísticas');
                }
                
                const data = await response.json();
                setDashboardStats(data);
                setTendenciaData(data.tendencia || generarTendenciaFallback());
            } catch (error) {
                console.error('Error al cargar stats del dashboard:', error);
                // Fallback a datos simulados
                setTendenciaData(generarTendenciaFallback());
            } finally {
                setLoading(false);
            }
        };

        cargarDashboardStats();
    }, [productos]);

    // Función fallback para generar datos simulados
    const generarTendenciaFallback = () => {
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const hoy = new Date();
        
        return diasSemana.map((dia, index) => {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - (6 - index));
            
            return {
                dia,
                fecha: fecha.toISOString().split('T')[0],
                stock: 245 + (index * 5),
                entrada: Math.floor(Math.random() * 15) + 10,
                salida: Math.floor(Math.random() * 10) + 5
            };
        });
    };

    // ==========================================
    // DATOS PARA GRÁFICOS (Memoizados)
    // ==========================================
    
    // Datos para el Pie Chart (Doughnut)
    const estadoData = useMemo(() => [
        { name: 'Activos', value: activos, color: '#6366f1' },
        { name: 'Inactivos', value: inactivos, color: '#ef4444' }
    ], [activos, inactivos]);

    // ==========================================
    // TOOLTIPS PERSONALIZADOS (Memoizados)
    // ==========================================
    
    const CustomPieTooltip = useMemo(() => memo(({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].name}</p>
                    <p className="tooltip-value" style={{ color: payload[0].payload.color }}>
                        {payload[0].value} productos
                    </p>
                    <p className="tooltip-percent">
                        {((payload[0].value / productos.length) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    }), [productos.length]);

    const CustomAreaTooltip = useMemo(() => memo(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Buscar la fecha correspondiente en tendenciaData
            const dataPoint = tendenciaData.find(d => d.dia === label);
            const fecha = dataPoint?.fecha || label;
            
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-date">{fecha}</p>
                    <p className="tooltip-value" style={{ color: '#6366f1' }}>
                        📦 Stock: {payload[0]?.value || 0}
                    </p>
                    {payload[1] && (
                        <p className="tooltip-value" style={{ color: '#10b981' }}>
                            ⬆️ Entradas: {payload[1].value}
                        </p>
                    )}
                    {payload[2] && (
                        <p className="tooltip-value" style={{ color: '#ef4444' }}>
                            ⬇️ Salidas: {payload[2].value}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    }), [tendenciaData]);

    if (loading && tendenciaData.length === 0) {
        return (
            <div className="dashboard-view-pro">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    // Actividad reciente (últimos 5 productos)
    const actividadReciente = [...productos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    return (
        <div className="dashboard-view-pro">
            {/* Grid de Tarjetas Compactas - 1 Fila */}
            <div className="stats-grid-compact">
                <div className="stat-card-mini">
                    <div className="stat-icon primary">
                        <i className="fas fa-boxes"></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{productos.length}</div>
                        <div className="stat-label">Total Productos</div>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <div className="stat-icon success">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{activos}</div>
                        <div className="stat-label">Activos</div>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <div className="stat-icon danger">
                        <i className="fas fa-times-circle"></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{inactivos}</div>
                        <div className="stat-label">Inactivos</div>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <div className="stat-icon warning">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stockBajo.length}</div>
                        <div className="stat-label">Stock Bajo</div>
                    </div>
                </div>
            </div>

            {/* Grid Principal: 65% Izquierda + 35% Derecha */}
            <div className="dashboard-grid-pro">
                {/* Columna Izquierda (65%) - Tendencia */}
                <div className="dashboard-card-pro trend-area">
                    <div className="card-header-pro">
                        <h3>
                            <i className="fas fa-chart-area"></i>
                            Tendencia de Inventario
                        </h3>
                        <span className="period-badge">Últimos 7 Días</span>
                    </div>
                    <div className="chart-wrapper-pro">
                        <ResponsiveContainer width="100%" height="100%" debounce={0}>
                            <AreaChart data={tendenciaData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35}/>
                                        <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15}/>
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.8} />
                                <XAxis 
                                    dataKey="dia" 
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px', fontWeight: '500' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px', fontWeight: '500' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomAreaTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="stock" 
                                    stroke="#6366f1" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorStock)"
                                    name="Stock Total"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Columna Derecha (35%) - Categorías + Actividad */}
                <div className="dashboard-right-pro">
                    {/* Gráfico Circular - Categorías */}
                    <div className="dashboard-card-pro category-card">
                        <div className="card-header-pro">
                            <h3>
                                <i className="fas fa-chart-pie"></i>
                                Estado Productos
                            </h3>
                        </div>
                        <div className="chart-wrapper-pro doughnut-wrapper">
                            <ResponsiveContainer width="100%" height="100%" debounce={0}>
                                <PieChart>
                                    <Pie
                                        data={estadoData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={4}
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        {estadoData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="doughnut-center-text">
                                <div className="center-number">{productos.length}</div>
                                <div className="center-text">Total</div>
                            </div>
                        </div>
                        <div className="legend-grid-pro">
                            <div className="legend-item-pro">
                                <span className="legend-color" style={{ background: '#6366f1' }}></span>
                                <span className="legend-text">Activos</span>
                                <span className="legend-value">{activos}</span>
                            </div>
                            <div className="legend-item-pro">
                                <span className="legend-color" style={{ background: '#ef4444' }}></span>
                                <span className="legend-text">Inactivos</span>
                                <span className="legend-value">{inactivos}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="dashboard-card-pro activity-card">
                        <div className="card-header-pro">
                            <h3>
                                <i className="fas fa-clock"></i>
                                Actividad Reciente
                            </h3>
                        </div>
                        <div className="activity-list-pro">
                            {actividadReciente.length === 0 ? (
                                <div className="empty-activity">
                                    <i className="fas fa-inbox"></i>
                                    <p>Sin actividad</p>
                                </div>
                            ) : (
                                actividadReciente.map(producto => (
                                    <div key={producto.id} className="activity-item-pro">
                                        <div className="activity-icon-wrapper">
                                            {parseInt(producto.stock) < 5 ? (
                                                <i className="fas fa-exclamation-circle" style={{ color: '#f59e0b' }}></i>
                                            ) : (
                                                <i className="fas fa-box" style={{ color: '#6366f1' }}></i>
                                            )}
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-title">{producto.nombre}</div>
                                            <div className="activity-meta">Stock: {producto.stock} unidades</div>
                                        </div>
                                        <div className={`activity-status ${parseInt(producto.stock) < 5 ? 'low' : 'normal'}`}>
                                            {parseInt(producto.stock) < 5 ? 'Bajo' : 'OK'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(DashboardView);
