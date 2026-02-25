import React, { useState, useEffect } from 'react';
import { actualizarProducto } from '../config/api';
import './Modal.css';

const EditModal = ({ product, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        dni: '',
        categoria_id: '',
        plan: '',
        fecha_pago: '',
        stock: '',
        estado: 'Activo',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                dni: product.dni || '',
                categoria_id: product.categoria_id || '',
                plan: product.plan || '',
                fecha_pago: product.fecha_pago || '',
                stock: product.stock || '',
                estado: product.estado || 'Activo',
            });
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.nombre || !formData.dni || !formData.categoria_id) {
            setError('Por favor, completa los campos obligatorios');
            return;
        }

        setLoading(true);

        try {
            const response = await actualizarProducto(product.id, formData);
            if (response.success) {
                onSuccess();
            } else {
                setError(response.message || 'Error al actualizar');
            }
        } catch (err) {
            console.error('Error al actualizar:', err);
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
                        <i className="fas fa-edit"></i>
                        Editar Producto
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
                            <input
                                type="text"
                                name="plan"
                                className="input"
                                value={formData.plan}
                                onChange={handleChange}
                                placeholder="Ej: Electrónica"
                            />
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
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
