import React, { useState } from 'react';
import { eliminarProducto } from '../config/api';
import './Modal.css';

const DeleteModal = ({ product, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await eliminarProducto(product.id);
            if (response.success) {
                onSuccess();
            } else {
                setError(response.message || 'Error al eliminar');
            }
        } catch (err) {
            console.error('Error al eliminar:', err);
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <i className="fas fa-trash"></i>
                        Eliminar Producto
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="form-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <div className="delete-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>¿Estás seguro de que deseas eliminar este producto?</p>
                        <div className="product-info">
                            <strong>{product?.nombre}</strong>
                            <span>Código: {product?.dni}</span>
                        </div>
                        <small>Esta acción no se puede deshacer.</small>
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
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-trash"></i>
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
