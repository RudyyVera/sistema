import React, { useState } from 'react';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';
import RegisterModal from './RegisterModal';
import './ProductTable.css';

const ProductTable = ({ productos, onProductUpdated, onProductDeleted, onProductCreated }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleEdit = (producto) => {
        setSelectedProduct(producto);
        setShowEditModal(true);
    };

    const handleDelete = (producto) => {
        setSelectedProduct(producto);
        setShowDeleteModal(true);
    };

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowRegisterModal(false);
        setSelectedProduct(null);
    };

    return (
        <div className="product-table-container">
            <div className="table-header">
                <h2>
                    <i className="fas fa-box"></i>
                    Lista de Productos
                </h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowRegisterModal(true)}
                >
                    <i className="fas fa-plus"></i>
                    Nuevo Producto
                </button>
            </div>

            <div className="table-wrapper">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Código</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    <div className="empty-state">
                                        <i className="fas fa-box-open"></i>
                                        <p>No hay productos registrados</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                                <tr key={producto.id}>
                                    <td data-label="ID">{producto.id}</td>
                                    <td className="product-name" data-label="Producto">
                                        <strong>{producto.nombre}</strong>
                                    </td>
                                    <td data-label="Codigo">{producto.dni}</td>
                                    <td data-label="Categoria">
                                        <span className="badge badge-category">
                                            {producto.plan}
                                        </span>
                                    </td>
                                    <td className="product-price" data-label="Precio">
                                        ${parseFloat(producto.fecha_pago).toFixed(2)}
                                    </td>
                                    <td data-label="Stock">
                                        <span
                                            className={`badge badge-stock ${
                                                parseInt(producto.stock) < 5
                                                    ? 'badge-stock-low'
                                                    : 'badge-stock-ok'
                                            }`}
                                        >
                                            {producto.stock}
                                        </span>
                                    </td>
                                    <td data-label="Estado">
                                        <span
                                            className={`badge ${
                                                producto.estado === 'Activo'
                                                    ? 'badge-success'
                                                    : 'badge-danger'
                                            }`}
                                        >
                                            {producto.estado}
                                        </span>
                                    </td>
                                    <td data-label="Acciones">
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(producto)}
                                                title="Editar"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(producto)}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showEditModal && (
                <EditModal
                    product={selectedProduct}
                    onClose={handleCloseModals}
                    onSuccess={() => {
                        handleCloseModals();
                        onProductUpdated();
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    product={selectedProduct}
                    onClose={handleCloseModals}
                    onSuccess={() => {
                        handleCloseModals();
                        onProductDeleted();
                    }}
                />
            )}

            {showRegisterModal && (
                <RegisterModal
                    onClose={handleCloseModals}
                    onSuccess={() => {
                        handleCloseModals();
                        onProductCreated();
                    }}
                />
            )}
        </div>
    );
};

export default ProductTable;
