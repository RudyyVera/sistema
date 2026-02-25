-- ==========================================
-- CREAR BASE DE DATOS INVENTORY SYSTEM
-- ==========================================
-- Script de inicialización de base de datos para Stocklin
-- Sistema de Gestión de Inventario
-- ==========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS inventory_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE inventory_system;

-- ==========================================
-- TABLA 1: CATEGORÍAS (opcional pero recomendada)
-- ==========================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion, activo) VALUES 
('Electrónica', 'Equipos electrónicos y accesorios', 1),
('Ropa', 'Prendas de vestir y accesorios', 1),
('Alimentos', 'Productos alimenticios', 1),
('Otros', 'Otros productos', 1)
ON DUPLICATE KEY UPDATE nombre = nombre;

-- ==========================================
-- TABLA 2: USUARIOS (para autenticación)
-- ==========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    nombre_completo VARCHAR(255),
    rol ENUM('admin', 'vendedor', 'viewer') DEFAULT 'vendedor',
    activo TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar usuario de prueba
INSERT INTO usuarios (username, password, email, nombre_completo, rol, activo) VALUES 
('admin', '123456', 'admin@stocklin.com', 'Administrador', 'admin', 1)
ON DUPLICATE KEY UPDATE password = '123456';

-- ==========================================
-- TABLA 3: PRODUCTOS (TABLA PRINCIPAL DE INVENTARIO)
-- ==========================================
-- Campos principales:
-- id: Identificador único de cada producto
-- nombre: Nombre del producto (mapeado del campo "nombre" en frontend)
-- codigo: Código único/SKU del producto (mapeado del campo "dni" en frontend)
-- categoria: Categoría del producto (mapeado del campo "plan" en frontend)
-- precio: Precio unitario (mapeado del campo "fecha_pago" en frontend)
-- stock: Cantidad disponible en inventario (mapeado del campo "estado" como número)
-- estado: Estado del producto (Activo/Inactivo)
-- descripcion: Descripción detallada del producto
-- ==========================================
CREATE TABLE IF NOT EXISTS productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    descripcion TEXT,
    proveedor VARCHAR(255),
    fecha_ultimo_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (codigo),
    INDEX (categoria),
    INDEX (estado)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- TABLA 4: MOVIMIENTOS DE INVENTARIO (histórico)
-- ==========================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    cantidad INT NOT NULL,
    descripcion TEXT,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX (producto_id),
    INDEX (tipo),
    INDEX (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- INSERTAR PRODUCTOS DE EJEMPLO (BASE DE DATOS VACÍA)
-- ==========================================
-- IMPORTANTE: Los productos se insertarán a través del frontend
-- Pero aquí hay ejemplos de la estructura esperada:
-- ==========================================

-- Ejemplo 1: Producto Electrónico
INSERT INTO productos (nombre, codigo, categoria, precio, stock, estado, descripcion, proveedor) 
VALUES ('Laptop Dell XPS 13', 'DELL-XPS-001', 'Electrónica', 1299.99, 5, 'Activo', 'Laptop de última generación', 'Dell Inc.')
ON DUPLICATE KEY UPDATE nombre = nombre;

-- Ejemplo 2: Producto de Ropa
INSERT INTO productos (nombre, codigo, categoria, precio, stock, estado, descripcion, proveedor) 
VALUES ('Camiseta Nike Classic', 'NIKE-SHIRT-001', 'Ropa', 49.99, 25, 'Activo', 'Camiseta de algodón puro', 'Nike')
ON DUPLICATE KEY UPDATE nombre = nombre;

-- Ejemplo 3: Producto de Alimentos
INSERT INTO productos (nombre, codigo, categoria, precio, stock, estado, descripcion, proveedor) 
VALUES ('Arroz integral 1kg', 'ARROZ-001', 'Alimentos', 3.99, 50, 'Activo', 'Arroz integral orgánico', 'Distribuidora Local')
ON DUPLICATE KEY UPDATE nombre = nombre;

-- ==========================================
-- VISTAS ÚTILES (Opcional)
-- ==========================================

-- Vista: Resumen de inventario con información de categoría
CREATE OR REPLACE VIEW resumen_inventario AS
SELECT -
    p.id,
    p.nombre,
    p.codigo,
    p.categoria,
    p.precio,
    p.stock,
    p.estado,
    (p.precio * p.stock) as valor_total,
    p.created_at
FROM productos p
WHERE p.estado = 'Activo'
ORDER BY p.nombre ASC;

-- Vista: Productos con stock bajo (menos de 10 unidades)
CREATE OR REPLACE VIEW productos_stock_bajo AS
SELECT 
    id,
    nombre,
    codigo,
    categoria,
    precio,
    stock,
    (10 - stock) as falta_para_minimo
FROM productos
WHERE stock < 10 AND estado = 'Activo'
ORDER BY stock ASC;

-- ==========================================
-- INFORMACIÓN DE LAS TABLAS CREADAS
-- ==========================================
-- Para verificar que todo se creó correctamente, ejecuta:
-- 
-- SHOW TABLES;  -- Mostrará todas las tablas creadas
-- DESC productos;  -- Mostrará estructura de tabla productos
-- SELECT * FROM productos;  -- Mostrar productos
-- SELECT * FROM usuarios;  -- Mostrar usuarios
-- SELECT * FROM categorias;  -- Mostrar categorías
-- ==========================================
