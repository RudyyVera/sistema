import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import './DashboardView.css';

const DashboardView = ({ productos, dashboardData, movimientos = [] }) => {
    const stockBajo = productos.filter((p) => parseInt(p.stock, 10) < 5);
    const activos = productos.filter((p) => p.estado === 'Activo').length;
    const inactivos = productos.filter((p) => p.estado === 'Inactivo').length;

    const tendenciaData = useMemo(() => {
        if (dashboardData?.tendencia && dashboardData.tendencia.length > 0) {
            return dashboardData.tendencia;
        }

        const diasSemana = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        const hoy = new Date();
        const stockTotal = productos.reduce((acc, producto) => acc + (parseInt(producto.stock, 10) || 0), 0);

        return diasSemana.map((dia, index) => {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - (6 - index));

            return {
                dia,
                fecha: fecha.toISOString().split('T')[0],
                stock: stockTotal
            };
        });
    }, [dashboardData, productos]);

    const valorInventarioLocal = useMemo(() => {
        return productos.reduce((total, producto) => {
            const precio = parseFloat(producto.fecha_pago) || 0;
            const stock = parseInt(producto.stock, 10) || 0;
            return total + (precio * stock);
        }, 0);
    }, [productos]);

    const totalProductosCard = dashboardData?.totalProductos ?? productos.length;
    const bajoStockCard = dashboardData?.bajoStock ?? stockBajo.length;
    const valorInventario = dashboardData?.valorInventario ?? valorInventarioLocal;

    const valorInventarioTexto = useMemo(() => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            maximumFractionDigits: 2
        }).format(valorInventario || 0);
    }, [valorInventario]);

    const estadoData = useMemo(
        () => [
            { name: 'Activos', value: activos, color: '#7c3aed' },
            { name: 'Inactivos', value: inactivos, color: '#ef4444' }
        ],
        [activos, inactivos]
    );

    const actividadReciente = useMemo(() => {
        if (Array.isArray(movimientos) && movimientos.length > 0) {
            return movimientos.slice(0, 5);
        }

        return [...productos]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5)
            .map((producto) => ({
                id: `fallback-${producto.id}`,
                tipo: 'salida',
                productoNombre: producto.nombre,
                cantidad: Math.max(1, parseInt(producto.stock, 10) || 1),
                fechaTexto: 'sin fecha'
            }));
    }, [movimientos, productos]);

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].name}</p>
                    <p className="tooltip-value" style={{ color: payload[0].payload.color }}>
                        {payload[0].value} productos
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomAreaTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = tendenciaData.find((d) => d.dia === label);
            const fecha = dataPoint?.fecha || label;

            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-date">{fecha}</p>
                    <p className="tooltip-value" style={{ color: '#7c3aed' }}>
                        Stock: {payload[0]?.value || 0}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (productos.length === 0 && tendenciaData.length === 0) {
        return (
            <div className="dashboard-view-pro">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-view-pro">
            <div className="dashboard-shell-grid dashboard-layout-grid">
                <div className="stats-grid stats-grid-compact">
                        <div className="stat-card-mini accent-purple">
                            <div className="stat-icon primary">
                                <i className="fas fa-boxes"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{totalProductosCard}</div>
                                <div className="stat-label">TOTAL PRODUCTOS</div>
                            </div>
                        </div>

                        <div className="stat-card-mini accent-green">
                            <div className="stat-icon success">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{activos}</div>
                                <div className="stat-label">ACTIVOS</div>
                            </div>
                        </div>

                        <div className="stat-card-mini accent-blue">
                            <div className="stat-icon info">
                                <i className="fas fa-dollar-sign"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value stat-value-money" title={valorInventarioTexto}>{valorInventarioTexto}</div>
                                <div className="stat-label">VALOR INVENTARIO</div>
                            </div>
                        </div>

                        <div className="stat-card-mini accent-yellow">
                            <div className="stat-icon warning">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{bajoStockCard}</div>
                                <div className="stat-label">STOCK BAJO</div>
                            </div>
                        </div>

                </div>

                <div className="main-content dashboard-left-column">
                    <div className="dashboard-card-pro trend-area">
                        <div className="card-header-pro">
                            <h3>
                                <i className="fas fa-chart-area"></i>
                                Tendencia de Inventario
                            </h3>
                            <span className="period-badge">ULTIMOS 7 DIAS</span>
                        </div>

                        <div className="chart-wrapper-pro">
                            <ResponsiveContainer width="100%" height="100%" debounce={0}>
                                <AreaChart data={tendenciaData} margin={{ top: 8, right: 20, left: -10, bottom: 8 }}>
                                    <defs>
                                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                                            <stop offset="70%" stopColor="#8b5cf6" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.03} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="dia"
                                        stroke="#94a3b8"
                                        style={{ fontSize: '11px', fontWeight: '600' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        style={{ fontSize: '11px', fontWeight: '600' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomAreaTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="stock"
                                        stroke="#7c3aed"
                                        strokeWidth={2.2}
                                        fillOpacity={1}
                                        fill="url(#colorStock)"
                                        name="Stock Total"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-card-pro activity-card-wide">
                        <div className="card-header-pro">
                            <h3>
                                <i className="fas fa-history"></i>
                                Actividad Reciente
                            </h3>
                            <span className="activity-count">{actividadReciente.length} eventos</span>
                        </div>

                        <div className="activity-timeline">
                            {actividadReciente.length === 0 ? (
                                <div className="empty-activity">
                                    <i className="fas fa-inbox"></i>
                                    <p>Sin actividad</p>
                                </div>
                            ) : (
                                actividadReciente.map((movimiento, idx) => (
                                    <div key={movimiento.id} className="timeline-item">
                                        <div className="timeline-icon">
                                            <i className={`fas ${movimiento.tipo === 'entrada' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                        </div>
                                        <div className="timeline-content">
                                            <p className="timeline-title">Movimiento: {movimiento.tipo}</p>
                                            <p className="timeline-name">{movimiento.productoNombre}</p>
                                            <p className="timeline-meta">Cantidad: {movimiento.cantidad}</p>
                                        </div>
                                        <div className="timeline-time">{movimiento.fechaTexto || `hace ${idx + 1} h`}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="activity-footer">
                            <button type="button" className="history-button">
                                Ver todo el historial
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="dashboard-right-column sidebar-right">
                    <div className="dashboard-card-pro category-card">
                        <div className="card-header-pro">
                            <h3>
                                <i className="fas fa-chart-pie"></i>
                                Estado Productos
                            </h3>
                        </div>

                        <div className="doughnut-layer-grid">
                            <div className="doughnut-chart-layer">
                                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                                    <PieChart>
                                        <Pie
                                            data={estadoData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={44}
                                            outerRadius={74}
                                            paddingAngle={3}
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
                            </div>
                            <div className="doughnut-center-layer">
                                <div className="center-number">{totalProductosCard}</div>
                                <div className="center-text">TOTAL</div>
                            </div>
                        </div>

                        <div className="legend-grid-pro">
                            <div className="legend-item-pro">
                                <span className="legend-color" style={{ background: '#7c3aed' }}></span>
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

                    <div className="dashboard-card-pro alerts-card">
                        <div className="card-header-pro">
                            <h3>
                                <i className="fas fa-bell" style={{ color: '#3b82f6' }}></i>
                                Alertas de Stock Bajo
                            </h3>
                        </div>

                        <div className="alerts-list">
                            {stockBajo.length === 0 && (
                                <div className="alert-row clean-state">
                                    <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i>
                                    <span>Sin alertas activas</span>
                                </div>
                            )}

                            {stockBajo.slice(0, 4).map((producto) => (
                                <div key={producto.id} className="alert-row">
                                    <div className="alert-main">
                                        <span className="alert-icon-wrap">
                                            <i className="fas fa-triangle-exclamation"></i>
                                        </span>
                                        <div>
                                            <p className="alert-name">{producto.nombre}</p>
                                            <p className="alert-sub">Stock actual: {producto.stock}</p>
                                        </div>
                                    </div>
                                    <span className="alert-check">
                                        <i className="fas fa-check"></i>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default React.memo(DashboardView);
