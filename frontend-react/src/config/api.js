import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token si existe
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (username, password) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
};

export const obtenerProductos = async () => {
    const response = await api.get('/api/socios');
    return response.data;
};

export const registrarProducto = async (producto) => {
    const response = await api.post('/api/registrar', producto);
    return response.data;
};

export const actualizarProducto = async (id, producto) => {
    const response = await api.put(`/api/socios/${id}`, producto);
    return response.data;
};

export const eliminarProducto = async (id) => {
    const response = await api.delete(`/api/socios/${id}`);
    return response.data;
};

export default api;
