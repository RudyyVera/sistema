// ==========================================
// IMPORTS
// ==========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

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

// Validar conexión a la base de datos
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('❌ Error al conectar a MySQL:', err);
        console.error('💡 Verifica que MySQL esté corriendo y la base de datos configurada en .env exista');
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
// RUTAS MOVIMIENTOS DE INVENTARIO
// ==========================================
const formatearFechaMovimiento = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getMovimientosHistorial = async (limit = 50) => {
    const sql = `
        SELECT
            m.id,
            m.tipo,
            m.cantidad,
            m.created_at,
            p.id AS productoId,
            p.nombre AS productoNombre,
            p.codigo AS productoCodigo,
            COALESCE(u.username, 'Sistema') AS usuarioNombre
        FROM movimientos_inventario m
        INNER JOIN productos p ON p.id = m.producto_id
        LEFT JOIN usuarios u ON u.id = m.usuario_id
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT ?
    `;

    const [rows] = await db.promise().query(sql, [Number(limit)]);
    return rows.map((row) => ({
        id: row.id,
        tipo: row.tipo,
        cantidad: Number(row.cantidad || 0),
        productoId: Number(row.productoId),
        productoNombre: row.productoNombre,
        productoCodigo: row.productoCodigo,
        usuarioNombre: row.usuarioNombre,
        createdAt: row.created_at,
        fechaTexto: formatearFechaMovimiento(row.created_at)
    }));
};

app.get('/api/movimientos', async (req, res) => {
    try {
        const historial = await getMovimientosHistorial(100);
        res.json(historial);
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.json([]);
        }

        console.error('❌ Error en /api/movimientos:', error);
        res.status(500).json({ error: 'Error al obtener movimientos', detalles: error.message });
    }
});

app.post('/api/movimientos', async (req, res) => {
    const { productoId, tipo, cantidad, usuario } = req.body;
    const tipoNormalizado = (tipo || '').toLowerCase();
    const cantidadNum = parseInt(cantidad, 10);
    const productoIdNum = parseInt(productoId, 10);

    if (!productoIdNum || !['entrada', 'salida'].includes(tipoNormalizado) || !cantidadNum || cantidadNum <= 0) {
        return res.status(400).json({ error: 'Datos de movimiento inválidos' });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        let usuarioId = usuario?.id ? parseInt(usuario.id, 10) : null;
        if (!usuarioId && usuario?.username) {
            const [users] = await conn.query('SELECT id FROM usuarios WHERE username = ? LIMIT 1', [usuario.username]);
            if (users.length > 0) {
                usuarioId = Number(users[0].id);
            }
        }

        const [productoRows] = await conn.query(
            'SELECT id, nombre, stock FROM productos WHERE id = ? FOR UPDATE',
            [productoIdNum]
        );

        if (productoRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const producto = productoRows[0];
        const stockActual = Number(producto.stock || 0);
        const nuevoStock = tipoNormalizado === 'entrada'
            ? stockActual + cantidadNum
            : stockActual - cantidadNum;

        if (nuevoStock < 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Stock insuficiente para registrar la salida' });
        }

        await conn.query('UPDATE productos SET stock = ? WHERE id = ?', [nuevoStock, productoIdNum]);

        const descripcion = `${tipoNormalizado} de ${cantidadNum} unidades`;
        const [insertResult] = await conn.query(
            'INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, descripcion, usuario_id) VALUES (?, ?, ?, ?, ?)',
            [productoIdNum, tipoNormalizado, cantidadNum, descripcion, usuarioId]
        );

        await conn.commit();

        const historial = await getMovimientosHistorial(100);
        res.status(201).json({
            success: true,
            mensaje: '✅ Movimiento registrado con éxito',
            movimientoId: insertResult.insertId,
            producto: {
                id: productoIdNum,
                nombre: producto.nombre,
                stockAnterior: stockActual,
                stockActual: nuevoStock
            },
            historial
        });
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error en /api/movimientos POST:', error);
        res.status(500).json({ error: 'Error al registrar movimiento', detalles: error.message });
    } finally {
        conn.release();
    }
});

// ==========================================
// RUTAS GET - DASHBOARD (RESUMEN, TENDENCIA, STATS)
// ==========================================
const getDashboardSummary = async () => {
    const summaryQuery = `
        SELECT
            COUNT(*) AS totalProductos,
            COALESCE(SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END), 0) AS activos,
            COALESCE(SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END), 0) AS inactivos,
            COALESCE(SUM(stock), 0) AS stockTotal,
            COALESCE(SUM(CASE WHEN stock < 5 THEN 1 ELSE 0 END), 0) AS bajoStock,
            COALESCE(SUM(precio * stock), 0) AS valorInventario
        FROM productos
    `;

    const [rows] = await db.promise().query(summaryQuery);
    const row = rows[0] || {};

    return {
        totalProductos: Number(row.totalProductos || 0),
        activos: Number(row.activos || 0),
        inactivos: Number(row.inactivos || 0),
        stockTotal: Number(row.stockTotal || 0),
        bajoStock: Number(row.bajoStock || 0),
        valorInventario: Number(row.valorInventario || 0)
    };
};

const getDashboardTrend = async (stockTotalActual) => {
    const trendQuery = `
        SELECT
            DATE(created_at) AS fecha,
            COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END), 0) AS entrada,
            COALESCE(SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END), 0) AS salida,
            COALESCE(SUM(CASE WHEN tipo = 'ajuste' THEN cantidad ELSE 0 END), 0) AS ajuste
        FROM movimientos_inventario
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY fecha ASC
    `;

    let movementRows = [];
    try {
        const [rows] = await db.promise().query(trendQuery);
        movementRows = rows;
    } catch (error) {
        if (error.code !== 'ER_NO_SUCH_TABLE') {
            throw error;
        }
    }

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const hoy = new Date();
    const mapPorFecha = new Map();

    movementRows.forEach((row) => {
        const key = new Date(row.fecha).toISOString().slice(0, 10);
        mapPorFecha.set(key, {
            entrada: Number(row.entrada || 0),
            salida: Number(row.salida || 0),
            ajuste: Number(row.ajuste || 0)
        });
    });

    const tendenciaBase = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const key = fecha.toISOString().slice(0, 10);
        const movimientos = mapPorFecha.get(key) || { entrada: 0, salida: 0, ajuste: 0 };

        tendenciaBase.push({
            fechaISO: key,
            dia: diasSemana[fecha.getDay()],
            fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
            entrada: movimientos.entrada,
            salida: movimientos.salida,
            ajuste: movimientos.ajuste,
            delta: movimientos.entrada - movimientos.salida + movimientos.ajuste
        });
    }

    const deltaTotal = tendenciaBase.reduce((acc, item) => acc + item.delta, 0);
    let stockAcumulado = Number(stockTotalActual || 0) - deltaTotal;

    return tendenciaBase.map((item) => {
        stockAcumulado += item.delta;
        return {
            dia: item.dia,
            fecha: item.fecha,
            stock: stockAcumulado,
            entrada: item.entrada,
            salida: item.salida
        };
    });
};

app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const summary = await getDashboardSummary();
        res.json(summary);
    } catch (error) {
        console.error('❌ Error en /api/dashboard/summary:', error);
        res.status(500).json({ error: 'Error al obtener el resumen del dashboard', detalles: error.message });
    }
});

app.get('/api/dashboard/trend', async (req, res) => {
    try {
        const summary = await getDashboardSummary();
        const tendencia = await getDashboardTrend(summary.stockTotal);
        res.json(tendencia);
    } catch (error) {
        console.error('❌ Error en /api/dashboard/trend:', error);
        res.status(500).json({ error: 'Error al obtener la tendencia del dashboard', detalles: error.message });
    }
});

app.get('/api/dashboard/stats', async (req, res) => {
    console.log('📊 Solicitud GET /api/dashboard/stats recibida');

    try {
        const summary = await getDashboardSummary();
        const tendencia = await getDashboardTrend(summary.stockTotal);

        res.json({
            ...summary,
            tendencia,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas del dashboard',
            detalles: error.message
        });
    }
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
    console.log(`📝 Base de datos: ${process.env.MYSQL_DATABASE || 'inventory_system_react'}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📚 Rutas disponibles:');
    console.log('   GET  /                      - Status del servidor');
    console.log('   POST /api/login             - Autenticar usuario');
    console.log('   GET  /api/socios            - Obtener todos los productos');
    console.log('   GET  /api/socios/:id        - Obtener un producto por ID');
    console.log('   POST /api/registrar         - Registrar nuevo producto');
    console.log('   PUT  /api/socios/:id        - Actualizar un producto');
    console.log('   DELETE /api/socios/:id      - Eliminar un producto');
    console.log('   GET  /api/movimientos       - Historial de movimientos');
    console.log('   POST /api/movimientos       - Registrar movimiento y actualizar stock');
    console.log('   GET  /api/dashboard/summary - Resumen del dashboard');
    console.log('   GET  /api/dashboard/trend   - Tendencia de inventario');
    console.log('   GET  /api/dashboard/stats   - Estadísticas del dashboard');
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