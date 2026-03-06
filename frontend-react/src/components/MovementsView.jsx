import React, { useMemo, useState } from 'react';
import { registrarMovimiento } from '../config/api';
import './MovementsView.css';

const MovementsView = ({ productos, movimientos, user, onMovementSaved }) => {
    const [tab, setTab] = useState('entrada');
    const [productoId, setProductoId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const productosActivos = useMemo(() => {
        return (productos || []).filter((p) => p.estado !== 'Inactivo');
    }, [productos]);

    const usuarioNombre = user?.username || user?.nombre || 'Empleado';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const cantidadNum = parseInt(cantidad, 10);
        if (!productoId || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
            setError('Selecciona un producto y una cantidad valida.');
            return;
        }

        try {
            setLoading(true);
            await registrarMovimiento({
                productoId: parseInt(productoId, 10),
                tipo: tab,
                cantidad: cantidadNum,
                usuario: {
                    id: user?.id,
                    username: user?.username,
                    rol: user?.rol || user?.role || (user?.username === 'admin' ? 'Admin' : 'Empleado')
                }
            });

            setCantidad('');
            if (onMovementSaved) {
                await onMovementSaved();
            }
        } catch (err) {
            setError(err?.response?.data?.error || 'No se pudo registrar el movimiento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="movements-view">
            <div className="movements-header">
                <h2>
                    <i className="fas fa-exchange-alt"></i>
                    Movimientos de Inventario
                </h2>
                <p>Registra entradas y salidas con historial en tiempo real</p>
            </div>

            <div className="movement-tabs">
                <button
                    type="button"
                    className={tab === 'entrada' ? 'active' : ''}
                    onClick={() => setTab('entrada')}
                >
                    Entrada
                </button>
                <button
                    type="button"
                    className={tab === 'salida' ? 'active' : ''}
                    onClick={() => setTab('salida')}
                >
                    Salida
                </button>
            </div>

            <form className="movement-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="mov-producto">Producto</label>
                    <select
                        id="mov-producto"
                        value={productoId}
                        onChange={(e) => setProductoId(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar producto</option>
                        {productosActivos.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                                {producto.nombre} ({producto.dni}) - Stock: {producto.stock}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="mov-cantidad">Cantidad</label>
                    <input
                        id="mov-cantidad"
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Usuario</label>
                    <input type="text" value={usuarioNombre} disabled />
                </div>

                {error && <p className="movement-error">{error}</p>}

                <button className="movement-submit" type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : `Registrar ${tab}`}
                </button>
            </form>

            <div className="movement-history-card">
                <h3>Historial Reciente</h3>
                <div className="movement-history-list">
                    {(!movimientos || movimientos.length === 0) && (
                        <p className="empty-history">Sin movimientos registrados.</p>
                    )}

                    {(movimientos || []).slice(0, 12).map((mov) => (
                        <div className="movement-row" key={mov.id}>
                            <span className={`movement-type ${mov.tipo}`}>{mov.tipo}</span>
                            <span className="movement-product">{mov.productoNombre}</span>
                            <span className="movement-qty">x{mov.cantidad}</span>
                            <span className="movement-user">{mov.usuarioNombre}</span>
                            <span className="movement-time">{mov.fechaTexto}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovementsView;
