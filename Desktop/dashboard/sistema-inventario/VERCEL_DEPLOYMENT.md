# 🚀 Guía de Despliegue en Vercel

## Pasos para desplegar en Vercel

### 1. Preparar el repositorio
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

### 2. Conectar a Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Iniciar sesión con GitHub
3. Hacer click en "New Project"
4. Seleccionar el repositorio `Sistema-inventario`
5. Click en "Import"

### 3. Configurar Variables de Entorno
En la página de configuración del proyecto, ir a **Settings > Environment Variables** y agregar:

```env
MYSQL_HOST=your-database-host
MYSQL_USER=your-database-user
MYSQL_PASSWORD=your-database-password
MYSQL_DATABASE=inventory_system
NODE_ENV=production
```

### 4. Configurar Build
- **Build Command**: `npm run build`
- **Output Directory**: No es necesario especificar uno
- **Install Command**: `npm install`

### 5. Variables de Entorno en Vercel

Vercel proporciona dos formas de agregar variables:

#### Opción A: Desde el dashboard de Vercel
1. Ir a Settings del proyecto
2. Environment Variables
3. Agregar cada variable

#### Opción B: Crear archivo `.env` localmente
Crear en la raíz:
```env
MYSQL_HOST=your_host
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=inventory_system
```

### 6. Deploy
Una vez configurado todo:
1. El proyecto se desplegará automáticamente
2. Vercel asignará una URL: `https://your-project-name.vercel.app`
3. El backend estará en: `https://your-project-name.vercel.app/api/`

## 📌 Consideraciones Importantes

### Base de Datos
- **Vercel NO incluye MySQL** hosting
- Debes usar un servicio externo como:
  - PlanetScale (MySQL serverless)
  - Supabase (PostgreSQL)
  - Heroku + JawsDB
  - AWS RDS

### Recomendación: PlanetScale
1. Ir a [planetscale.com](https://planetscale.com)
2. Crear una cuenta gratuita
3. Crear una base de datos
4. Obtener les credenciales de conexión
5. Usar esas credenciales en las variables de entorno de Vercel

### Archivos Importantes
- `vercel.json` - Configuración de Vercel
- `.vercelignore` - Archivos a ignorar
- `backend/.env.example` - Variables de ejemplo

## 🔄 CI/CD

El proyecto está configurado para:
- Deploy automático en cada push a `master`
- Construcción automática del frontend
- Inicialización del servidor backend

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Error: "Port already in use"
Vercel asigna puertos automáticamente. No es necesario especificar puerto.

### Error: "Database connection failed"
Verificar que las credenciales en las variables de entorno sean correctas.

## 📝 Monitoreo

Ver logs en tiempo real:
```bash
vercel logs
```

## 🔐 Seguridad

- Nunca commitear archivos `.env` con credenciales reales
- Usar `.gitignore` correctamente
- Guardar credenciales en Vercel Dashboard, no en código
- Usar conexiones encriptadas (SSL) a la base de datos

---

¡Listo! Tu proyecto debería estar desplegado en Vercel.
