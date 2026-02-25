// ==========================================
// IMPORTS
// ==========================================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// ==========================================
// INICIALIZACION
// ==========================================
const app = express();

// ==========================================
// CONFIGURACION CORS - MUY IMPORTANTE
// ==========================================
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3002',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para loguear peticiones
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url} - Origen: ${req.get('origin')}`);
    next();
});

// ==========================================
// CONEXION A BASE DE DATOS
// ==========================================
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'inventory_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Validar conexión a la base de datos
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('❌ Error al conectar a MySQL:', err);
        console.error('💡 Verifica que MySQL esté corriendo y la base de datos "inventory_system" exista');
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL');
});

// ==========================================
// RUTA DE PRUEBA
// ==========================================
app.get('/', (req, res) => {
    res.json({ 
        mensaje: '✅ Servidor funcionando correctamente en puerto 5000',
        cors: 'Habilitado para http://localhost:3000',
        estado: 'Operacional'
    });
});

// ==========================================
// RUTA POST - LOGIN DE USUARIOS
// ==========================================
app.post('/api/login', (req, res) => {
    console.log('🔐 Solicitud POST /api/login recibida');
    
    const { username, password } = req.body;
    
    // Validación básica
    if (!username || !password) {
        console.error('❌ Credenciales incompletas');
        return res.status(400).json({ 
            success: false,
            error: 'Usuario y contraseña son requeridos'
        });
    }

    // Consulta a la base de datos
    const sql = "SELECT id, username FROM usuarios WHERE username = ? AND password = ?";
    
    db.query(sql, [username.trim(), password], (err, result) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al verificar credenciales'
            });
        }

        // Si no hay resultados, credenciales inválidas
        if (result.length === 0) {
            console.warn(`⚠️ Intento de login fallido para usuario: ${username}`);
            return res.status(401).json({ 
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }

        // Login exitoso
        const usuario = result[0];
        console.log(`✅ Login exitoso para usuario: ${username}`);
        
        res.status(200).json({ 
            success: true,
            mensaje: '✅ Login exitoso',
            usuario: {
                id: usuario.id,
                username: usuario.username
            }
        });
    });
});

// ==========================================
// RUTA POST - REGISTRAR NUEVO PRODUCTO
// ==========================================
app.post('/api/registrar', (req, res) => {
    console.log('📝 Solicitud POST /api/registrar recibida');
    console.log('📦 Datos recibidos:', req.body);
    
    const { nombre, dni, plan, fecha_pago, stock } = req.body;
    
    // Mapeo de campos del frontend a columnas de base de datos
    const nombreProducto = nombre;           // nombre (VARCHAR 255)
    const codigoProducto = dni;              // codigo (VARCHAR 100 UNIQUE)
    const categoriaProducto = plan;          // categoria (VARCHAR 100)
    const precioProducto = parseFloat(fecha_pago) || 0;  // precio (DECIMAL 10,2)
    const stockProducto = parseInt(stock, 10);
    const estadoProducto = 'Activo';         // estado (ENUM)
    
    // Validación básica
    if (!nombre || !dni || !plan || !fecha_pago || stock === undefined || stock === null || stock === '') {
        console.error('❌ Campos faltantes:', { nombre: !nombre, dni: !dni, plan: !plan, fecha_pago: !fecha_pago, stock: stock === undefined || stock === null || stock === '' });
        return res.status(400).json({ 
            error: 'Faltan campos requeridos',
            campos: { nombre, dni, plan, fecha_pago, stock }
        });
    }

    // Validar que no estén vacíos
    if (nombre.trim() === '' || dni.trim() === '' || fecha_pago.toString().trim() === '' || Number.isNaN(stockProducto)) {
        return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
    }
    
    // INSERT usando los nombres correctos de columnas de la tabla productos
    const sql = "INSERT INTO productos (nombre, codigo, categoria_id, precio, stock, estado) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [nombreProducto.trim(), codigoProducto.trim(), categoriaProducto, precioProducto, stockProducto, estadoProducto], (err, result) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'Codigo ya existe',
                    code: 'DUPLICATE_CODE',
                    detalles: err.message
                });
            }
            return res.status(500).json({ 
                error: 'Error al guardar el producto',
                detalles: err.message
            });
        }
        console.log('✅ Producto registrado exitosamente. ID:', result.insertId);
        res.status(201).json({ 
            success: true,
            mensaje: '✅ Producto registrado con éxito',
            id: result.insertId,
            producto: {
                id: result.insertId,
                nombre: nombreProducto,
                dni: codigoProducto,
                plan: categoriaProducto,
                fecha_pago: precioProducto,
                stock: stockProducto,
                estado: estadoProducto
            }
        });
    });
});

// ==========================================
// RUTA GET - OBTENER TODOS LOS PRODUCTOS
// ==========================================
app.get('/api/socios', (req, res) => {
    console.log('📖 Solicitud GET /api/socios recibida');
    
    // SELECT con JOIN y aliases para compatibilidad con frontend React
    const sql = `SELECT p.id, p.nombre, p.codigo AS dni, c.nombre AS plan, p.categoria_id, p.precio AS fecha_pago, p.stock, p.estado, p.descripcion
                 FROM productos p
                 LEFT JOIN categorias c ON p.categoria_id = c.id
                 ORDER BY p.id DESC`;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            // Si la tabla no existe, retornar array vacío con mensaje
            if (err.code === 'ER_NO_SUCH_TABLE') {
                console.warn('⚠️ Tabla productos no existe. Retornando array vacío.');
                return res.json([]);
            }
            return res.status(500).json({ 
                error: 'Error al obtener productos',
                detalles: err.message
            });
        }
        
        if (result.length === 0) {
            console.log('ℹ️ Base de datos vacía - No hay productos registrados en MySQL');
        } else {
            console.log(`✅ Retornando ${result.length} productos`);
        }
        
        res.json(result);
    });
});

// ==========================================
// RUTA GET - OBTENER UN PRODUCTO POR ID
// ==========================================
app.get('/api/socios/:id', (req, res) => {
    const { id } = req.params;
    console.log(`📖 Solicitud GET /api/socios/${id} recibida`);
    
    // SELECT con JOIN y aliases para compatibilidad con frontend React
    const sql = `SELECT p.id, p.nombre, p.codigo AS dni, c.nombre AS plan, p.categoria_id, p.precio AS fecha_pago, p.stock, p.estado, p.descripcion
                 FROM productos p
                 LEFT JOIN categorias c ON p.categoria_id = c.id
                 WHERE p.id = ?`;
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            return res.status(500).json({ 
                error: 'Error al obtener el producto',
                detalles: err.message
            });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
        }
        res.json(result[0]);
    });
});

// ==========================================
// RUTA PUT - ACTUALIZAR PRODUCTO
// ==========================================
app.put('/api/socios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, dni, categoria_id, fecha_pago, stock, estado } = req.body;
    
    console.log(`✏️ Solicitud PUT /api/socios/${id} recibida`);
    console.log('📦 Datos:', { nombre, dni, categoria_id, fecha_pago, stock, estado });
    
    // Validación básica
    if (!nombre || !dni || categoria_id === undefined || categoria_id === '') {
        console.error('❌ Campos faltantes:', { nombre: !nombre, dni: !dni, categoria_id: categoria_id === undefined });
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Mapeo de campos del frontend a columnas de base de datos
    const nombreProducto = nombre;
    const codigoProducto = dni;
    const categoriaIdProducto = parseInt(categoria_id) || 1;
    const precioProducto = parseFloat(fecha_pago) || 0;
    const stockProducto = parseInt(stock) || 0;
    const estadoProducto = estado || 'Activo';
    
    // UPDATE usando los nombres correctos de columnas
    const sql = "UPDATE productos SET nombre = ?, codigo = ?, categoria_id = ?, precio = ?, stock = ?, estado = ? WHERE id = ?";
    
    db.query(sql, [nombreProducto, codigoProducto, categoriaIdProducto, precioProducto, stockProducto, estadoProducto, id], (err, result) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'Codigo ya existe',
                    code: 'DUPLICATE_CODE',
                    detalles: err.message
                });
            }
            return res.status(500).json({ error: 'Error al actualizar el producto', detalles: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
        }
        console.log(`✅ Producto ${id} actualizado exitosamente`);
        res.json({ success: true, mensaje: '✅ Producto actualizado con éxito' });
    });
});

// ==========================================
// RUTA DELETE - ELIMINAR PRODUCTO
// ==========================================
app.delete('/api/socios/:id', (req, res) => {
    const { id } = req.params;
    
    console.log(`🗑️ Solicitud DELETE /api/socios/${id} recibida`);
    
    const sql = "DELETE FROM productos WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
        }
        console.log(`✅ Producto ${id} eliminado exitosamente`);
        res.json({ success: true, mensaje: '✅ Producto eliminado con éxito' });
    });
});

// ==========================================
// RUTA POST - CREAR PRODUCTO DESDE ESCANEO
// ==========================================
app.post('/api/productos/from-scan', (req, res) => {
    console.log('🔍 Solicitud POST /api/productos/from-scan recibida');
    
    const { codigo } = req.body;
    
    // Validación básica
    if (!codigo || codigo.trim() === '') {
        console.error('❌ Codigo vacío recibido');
        return res.status(400).json({ 
            error: 'El código escaneado no puede estar vacío'
        });
    }

    // Verificar si el código ya existe
    const checkSql = "SELECT id FROM productos WHERE codigo = ?";
    db.query(checkSql, [codigo.trim()], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('❌ Error al verificar código:', checkErr);
            return res.status(500).json({ error: 'Error al verificar código' });
        }

        // Si ya existe, retornar error
        if (checkResult.length > 0) {
            console.warn(`⚠️ Código ya existe: ${codigo}`);
            return res.status(409).json({ 
                error: 'Código ya existe en la base de datos',
                id: checkResult[0].id
            });
        }

        // Crear nuevo producto con valores predeterminados
        const nombre = 'Portafolio';
        const categoria_id = 1;  // Categoría por defecto
        const precio = 0;
        const stock = 1;
        const estado = 'Activo';

        const sql = "INSERT INTO productos (nombre, codigo, categoria_id, precio, stock, estado) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.query(sql, [nombre, codigo.trim(), categoria_id, precio, stock, estado], (err, result) => {
            if (err) {
                console.error('❌ Error al guardar producto:', err);
                return res.status(500).json({ 
                    error: 'Error al guardar el producto',
                    detalles: err.message
                });
            }

            console.log('✅ Producto creado desde escaneo. ID:', result.insertId);
            
            // Retornar el producto completo con el nombre de la categoría
            const selectSql = `SELECT p.id, p.nombre, p.codigo AS dni, c.nombre AS plan, p.categoria_id, 
                               p.precio AS fecha_pago, p.stock, p.estado, p.descripcion
                               FROM productos p
                               LEFT JOIN categorias c ON p.categoria_id = c.id
                               WHERE p.id = ?`;
            
            db.query(selectSql, [result.insertId], (selectErr, selectResult) => {
                if (selectErr) {
                    console.error('❌ Error al recuperar producto:', selectErr);
                    return res.status(500).json({ error: 'Error al recuperar el producto' });
                }

                res.status(201).json({ 
                    success: true,
                    mensaje: '✅ Producto creado desde escaneo',
                    producto: selectResult[0]
                });
            });
        });
    });
});

// ==========================================
// MANEJO DE ERRORES 404
// ==========================================
app.use((req, res) => {
    console.warn(`⚠️ Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        metodo: req.method,
        ruta: req.url
    });
});

// ==========================================
// MANEJO DE ERRORES GLOBAL
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        mensaje: err.message
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 SERVIDOR INVENTORY SYSTEM INICIADO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`✅ CORS habilitado para: http://localhost:3000`);
    console.log(`📝 Base de datos: ${process.env.MYSQL_DATABASE || 'inventory_system'}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📚 Rutas disponibles:');
    console.log('   GET  /                  - Status del servidor');
    console.log('   POST /api/login         - Autenticar usuario');
    console.log('   GET  /api/socios        - Obtener todos los productos');
    console.log('   GET  /api/socios/:id    - Obtener un producto por ID');
    console.log('   POST /api/registrar     - Registrar nuevo producto');
    console.log('   PUT  /api/socios/:id    - Actualizar un producto');
    console.log('   DELETE /api/socios/:id  - Eliminar un producto');
    console.log('═══════════════════════════════════════════════════════\n');
});

// Manejo de cierre graceful
server.on('error', (err) => {
    console.error('❌ Error del servidor:', err);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️ Señal SIGTERM recibida. Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});