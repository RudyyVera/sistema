# Sistema de Gestión de Inventario - Stocklin

Sistema completo de gestión de inventario con backend en Node.js/Express y frontend en HTML/Webpack.

## 📋 Características

- ✅ Gestión de productos con categorías
- ✅ Control de stock
- ✅ Autenticación de usuarios
- ✅ Reporte de inventario
- ✅ Interfaz responsive
- ✅ API REST completa

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express.js
- MySQL 2
- CORS
- Dotenv

**Frontend:**
- HTML5 + CSS3
- JavaScript ES6+
- Webpack
- Axios

## 🚀 Requisitos Previos
- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **MySQL** instalado y ejecutándose
- Puerto **5000** disponible para el backend
- Puerto **3000** disponible para el frontend

### 2. Configurar la Base de Datos

#### Paso 1: Acceso a MySQL
Abre una terminal/consola y conecta a MySQL:

```bash
mysql -u root -p
```

Si no tienes contraseña, solo ejecuta:
```bash
mysql -u root
```

#### Paso 2: Ejecutar el Script de Configuración
Copia el contenido del archivo `setup.sql` y ejecútalo en MySQL, o desde la terminal:

```bash
mysql -u root < setup.sql
```

O directamente en MySQL (después de conectarte):
```sql
SOURCE ruta/a/setup.sql;
```

**Que se cree:**
✅ Base de datos `inventory_system`
✅ Tabla `usuarios` con usuario de prueba (admin:123456)
✅ Tabla `productos` con 8 productos de ejemplo
✅ Esquema completo listo para producción

### 3. Configurar el Backend

#### Paso 1: Instalar dependencias
```bash
cd backend
npm install
```

#### Paso 2: Iniciar el servidor
```bash
node index.js
```

**Deberías ver:**
```
═══════════════════════════════════════════════════════
🚀 SERVIDOR INVENTORY SYSTEM INICIADO
═══════════════════════════════════════════════════════
🌐 URL: http://localhost:5000
✅ CORS habilitado para: http://localhost:3000
📝 Base de datos: inventory_system
═══════════════════════════════════════════════════════
```

### 4. Iniciar el Frontend

#### Paso 1: Navega a la carpeta frontend
```bash
cd frontend
```

#### Paso 2: Abre el archivo en el navegador
Simplemente abre `index.html` en tu navegador favorito:
```
http://localhost:3000/
```

O puedes usar un servidor local:
```bash
# Si tienes Python 3
python -m http.server 3000

# Si tienes Python 2
python -m SimpleHTTPServer 3000
```

### 5. Credenciales de Prueba

**Usuario:** `admin`
**Contraseña:** `123456`

### 6. Estructura del Proyecto

```
sistema-gym/
├── backend/
│   ├── index.js           (Servidor Express)
│   ├── package.json       (Dependencias)
│   └── node_modules/      (Instalado con npm install)
├── frontend/
│   └── index.html         (Aplicación completa SPA)
└── setup.sql              (Script de base de datos)
```

### 7. Dependencias Instaladas

**Backend (package.json):**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.1.0",
    "dotenv": "^16.0.3"
  }
}
```

**Frontend:**
- Vanilla JavaScript (Sin dependencias)
- Axios (para HTTP requests)
- Font Awesome 6.4.0 (iconos)
- Google Fonts - Inter (tipografía)

### 8. API Endpoints Disponibles

#### Autenticación
```
POST /api/login
Payload: { username, password }
Response: { success, usuario: { id, username } }
```

#### Productos
```
GET /api/socios                    - Obtener todos los productos
GET /api/socios/:id                - Obtener producto por ID
POST /api/registrar                - Crear nuevo producto
PUT /api/socios/:id                - Actualizar producto
DELETE /api/socios/:id             - Eliminar producto
```

### 9. Solución de Problemas

#### Error: "El puerto 5000 ya está en uso"
```bash
# En Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# En Mac/Linux:
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

#### Error: "Base de datos no encontrada"
- Verifica que MySQL esté corriendo
- Ejecuta nuevamente el script `setup.sql`
- Comprueba que `inventory_system` existe: `SHOW DATABASES;`

#### Error: "CORS Error en el navegador"
- Asegúrate que el backend está corriendo en el puerto 5000
- Verifica que el frontend accede a `http://localhost:5000`

#### Error: "Tabla 'productos' no existe"
- Ejecuta: `USE inventory_system; SHOW TABLES;`
- Si la tabla no existe, ejecuta `setup.sql` nuevamente

### 10. Características Implementadas

✅ **Autenticación** - Login seguro con sesión
✅ **CRUD Completo** - Crear, leer, actualizar y eliminar productos
✅ **Búsqueda** - Filtrar productos por nombre o código
✅ **Estadísticas** - Panel con métricas de inventario
✅ **Tema Oscuro/Claro** - Toggle con persistencia
✅ **Diseño Responsivo** - Interfaz moderna y limpia
✅ **Validación de Datos** - En frontend y backend
✅ **Mensajes de Éxito/Error** - Feedback visual claro
✅ **Modal Forms** - Interfaz amigable para CRUD
✅ **Bento Grid Stats** - Visualización moderna de métricas

### 11. Información de la Base de Datos

#### Tabla: usuarios
```sql
- id (INT, PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- password (VARCHAR)
- email (VARCHAR)
- created_at (TIMESTAMP)
```

#### Tabla: productos
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- code (VARCHAR, UNIQUE)
- category (VARCHAR)
- price (DECIMAL)
- stock (INT)
- status (ENUM: Activo/Inactivo)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 12. Desarrollo y Debugging

**Ver logs del servidor:**
Los logs se mostrarán en la terminal donde ejecutaste `node index.js`

**Abrir consola del navegador:**
- Chrome/Edge: F12 or Ctrl+Shift+I
- Firefox: F12
- Safari: Cmd+Option+I

**Resetear la base de datos:**
```bash
mysql -u root < setup.sql
```

### 13. Próximos Pasos

🔄 **Personalización:**
- Agregar más categorías de productos
- Crear reportes avanzados
- Implementar notificaciones de stock bajo
- Integración con otros sistemas

📱 **Escalabilidad:**
- Agregar autenticación JWT
- Implementar roles y permisos
- Crear API versioning
- Agregar caching

---

**Soporte:** Si encuentras problemas, verifica que:
1. MySQL está corriendo
2. `setup.sql` fue ejecutado correctamente
3. El backend está en puerto 5000
4. El frontend accede a `http://localhost:5000`
5. No hay conflictos de puertos

¡Tu sistema de inventario está listo para usar! 🎉
