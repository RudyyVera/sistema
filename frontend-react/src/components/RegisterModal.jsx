import React, { useState } from 'react';
import { registrarProducto } from '../config/api';
import './Modal.css';

const RegisterModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        dni: '',
        plan: '',
        fecha_pago: '',
        stock: '',
        estado: 'Activo',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.nombre || !formData.dni || !formData.plan) {
            setError('Por favor, completa los campos obligatorios');
            return;
        }

        setLoading(true);

        try {
            const response = await registrarProducto(formData);
            if (response.success) {
                onSuccess();
            } else {
                setError(response.message || 'Error al registrar');
            }
        } catch (err) {
            console.error('Error al registrar:', err);
            const apiError = err?.response?.data;
            if (apiError?.code === 'DUPLICATE_CODE') {
                setError('El codigo ya existe. Usa otro codigo.');
            } else if (apiError?.error) {
                setError(apiError.error);
            } else {
                setError('Error al conectar con el servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <i className="fas fa-plus"></i>
                        Registrar Nuevo Producto
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && (
                        <div className="form-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre del Producto *</label>
                            <input
                                type="text"
                                name="nombre"
                                className="input"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Laptop Dell"
                            />
                        </div>

                        <div className="form-group">
                            <label>Código *</label>
                            <input
                                type="text"
                                name="dni"
                                className="input"
                                value={formData.dni}
                                onChange={handleChange}
                                placeholder="Ej: PROD-001"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Categoría *</label>
                            <select
                                name="plan"
                                className="input"
                                value={formData.plan}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="1">Electronica</option>
                                <option value="2">Ropa</option>
                                <option value="3">Alimentos</option>
                                <option value="4">Hogar</option>
                                <option value="5">Otros</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Precio</label>
                            <input
                                type="number"
                                step="0.01"
                                name="fecha_pago"
                                className="input"
                                value={formData.fecha_pago}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Stock</label>
                            <input
                                type="number"
                                name="stock"
                                className="input"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Estado</label>
                            <select
                                name="estado"
                                className="input"
                                value={formData.estado}
                                onChange={handleChange}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    Registrar Producto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
