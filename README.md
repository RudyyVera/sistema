# 📦 Stocklin - Sistema de Gestión de Inventario

Sistema completo de gestión de inventario con backend en Node.js/Express y frontend en React.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

- ✅ **Gestión completa de productos** con categorías y stock
- ✅ **Escáner QR/Código de barras** integrado con cámara
- ✅ **Autenticación de usuarios** con roles
- ✅ **Reportes de inventario** exportables (PDF/Excel)
- ✅ **Modo oscuro** con persistencia
- ✅ **Interfaz moderna** ultra-responsive (diseño Apple/Vercel)
- ✅ **API REST** completa y documentada
- ✅ **Control de movimientos** de inventario

## 🛠️ Tecnologías

### Backend
- Node.js + Express.js
- MySQL 2
- CORS
- Dotenv

### Frontend
- React 18
- Axios para peticiones HTTP
- @zxing/browser para escaneo QR
- HTML2PDF.js para reportes
- XLSX para exportación Excel
- CSS moderno con variables y dark mode

## 📋 Requisitos Previos

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **MySQL** >= 5.7
- Puerto **5000** disponible (backend)
- Puerto **3000** disponible (frontend)

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/stocklin.git
cd stocklin

```

### 2. Instalar todas las dependencias
```bash
npm run install-all
```

Este comando instalará automáticamente las dependencias de:
- Raíz (concurrently)
- Backend (Express, MySQL, etc.)
- Frontend React (React, Axios, etc.)

### 3. Configurar la Base de Datos

#### Opción A: Desde la terminal
```bash
mysql -u root -p < setup.sql
```

#### Opción B: Desde MySQL Workbench o cliente
1. Abre MySQL y conéctate
2. Ejecuta el archivo `setup.sql`

**Esto creará:**
- Base de datos `inventory_system`
- Tabla `usuarios` (usuario de prueba: **admin** / **123456**)
- Tabla `productos` con datos de ejemplo
- Tabla `categorias`
- Tabla `movimientos_inventario`

### 4. Configurar variables de entorno

#### Backend
Crea el archivo `backend/.env`:
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=inventory_system
PORT=5000
NODE_ENV=development
```

#### Frontend React
Crea el archivo `frontend-react/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
PORT=3000
```

### 5. Iniciar el proyecto

#### Modo desarrollo (ambos servidores)
```bash
npm run dev
```

#### Iniciar individualmente

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend-react
npm start
```

## 🌐 Acceso

Una vez iniciado, accede a:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Credenciales de prueba
- **Usuario:** admin
- **Contraseña:** 123456

## 📱 Funcionalidades Principales

### 🎯 Dashboard
- Visualización de estadísticas en tiempo real
- Productos con stock bajo
- Productos agotados
- Total de productos activos

### 📦 Gestión de Productos
- Crear, editar y eliminar productos
- Asignar categorías
- Control de stock y precios
- Estados: Disponible/Agotado/Descontinuado

### 📷 Escáner QR/Código de Barras
- Escaneo con cámara en tiempo real
- Guardado automático en base de datos
- Detección de duplicados
- Compatible con múltiples formatos

### 📊 Reportes
- Exportar a PDF
- Exportar a Excel
- Filtros por categoría y estado
- Vista previa antes de exportar

### 🌙 Modo Oscuro
- Toggle en el header
- Persistencia con localStorage
- Paleta de colores profesional (Slate Gray + Emerald Green)

## 🎨 Diseño

El sistema utiliza un diseño moderno inspirado en Apple y Vercel:
- **Login:** Split screen con glassmorphism y mesh gradients
- **Dashboard:** Card system con sombras suaves
- **Colores:** Slate Gray (#0f172a) + Emerald Green (#10b981)
- **Tipografía:** Inter (importada desde Google Fonts)
- **Espaciado:** Sistema de spacing premium para aspecto limpio

## 📂 Estructura del Proyecto

```
stocklin/
├── backend/
│   ├── index.js          # Servidor Express y rutas API
│   ├── package.json
│   ├── .env.example
│   └── .env             # Variables de entorno (no incluido en Git)
├── frontend-react/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── config/      # Configuración API
│   │   ├── App.js       # Componente principal
│   │   └── App.css      # Estilos globales con variables CSS
│   ├── public/
│   ├── package.json
│   └── .env             # Variables de entorno (no incluido en Git)
├── setup.sql            # Script de base de datos
├── package.json         # Scripts para ejecutar todo el proyecto
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión

### Productos
- `GET /api/productos` - Listar todos los productos
- `POST /api/productos` - Crear producto
- `POST /api/productos/from-scan` - Crear desde escaneo QR
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Categorías
- `GET /api/categorias` - Listar categorías

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

## 🐛 Troubleshooting

### Puerto ocupado
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo
- Confirma credenciales en `backend/.env`
- Verifica que la base de datos `inventory_system` exista

### Error CORS
- Asegúrate de que el backend esté corriendo en puerto 5000
- Verifica que `REACT_APP_API_URL` apunte a http://localhost:5000

## 🚀 Deployment

### Backend (Railway/Render)
1. Crear cuenta en Railway o Render
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Agregar servicio MySQL
5. Deploy automático desde main branch

### Frontend (Vercel)
1. Instalar Vercel CLI: `npm i -g vercel`
2. Desde `frontend-react/`: `vercel`
3. Seguir instrucciones
4. Configurar variable `REACT_APP_API_URL` con URL del backend

Ver `vercel.json` para configuración de deployment.

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios fines.

## 👨‍💻 Autor

Creado con ❤️ para gestión de inventarios moderna y eficiente.

---

⭐ Si te gustó este proyecto, dale una estrella en GitHub!

