import React, { useState } from 'react';
import { loginUser } from '../config/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorField, setErrorField] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrorField('');

        if (!username || !password) {
            setError('Por favor, completa todos los campos');
            if (!username) {
                setErrorField('username');
            } else if (!password) {
                setErrorField('password');
            }
            return;
        }

        setLoading(true);

        try {
            const response = await loginUser(username, password);
            
            if (response.success) {
                // Guardar usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify({
                    username: response.usuario.username,
                    nombre: response.usuario.nombre_completo,
                    rol: response.usuario.rol,
                    loggedIn: true
                }));
                
                onLoginSuccess(response.usuario);
            } else {
                setError(response.message || 'Credenciales incorrectas');
                setErrorField('both');
            }
        } catch (err) {
            console.error('Error en login:', err);
                if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                    setError('⚠️ No se puede conectar al backend. Verifica que esté corriendo en http://localhost:5000');
                } else if (err.response) {
                    setError(`Error del servidor: ${err.response.data?.message || 'Error desconocido'}`);
                } else {
                    setError('Error al conectar con el servidor. Revisa la consola para más detalles.');
                }
            setErrorField('both');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Lado Visual - Mesh Gradient */}
            <div className="login-visual-side">
                <div className="login-visual-content">
                    <div className="login-visual-icon">
                        <i className="fas fa-boxes"></i>
                    </div>
                    <h1>Stocklin</h1>
                    <p>Controla inventario en tiempo real con un flujo elegante y seguro.</p>
                </div>
            </div>

            {/* Lado Formulario - Glassmorphism */}
            <div className="login-form-side">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Iniciar sesión</h2>
                        <p>Accede a tu panel de inventario</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                type="text"
                                id="username"
                                className={errorField === 'username' || errorField === 'both' ? 'error' : ''}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                className={errorField === 'password' || errorField === 'both' ? 'error' : ''}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                            />
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <label htmlFor="remember">Recordarme</label>
                        </div>

                        <button
                            type="submit"
                            className="btn-login"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i>
                                    Ingresar
                                </>
                            )}
                        </button>

                        <div className="login-footer">
                            <p>
                                Usuario de prueba: <strong>admin</strong> · 
                                Contraseña: <strong>123456</strong>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
