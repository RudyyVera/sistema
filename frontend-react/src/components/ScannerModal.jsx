import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import './ScannerModal.css';

const ScannerModal = ({ onClose, onDetected }) => {
    const videoRef = useRef(null);
    const controlsRef = useRef(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);

    const guardarProductoEscanado = async (codigo) => {
        try {
            const response = await axios.post('http://localhost:5000/api/productos/from-scan', {
                codigo: codigo
            });
            
            if (response.data.success) {
                onDetected(response.data.producto);
                if (controlsRef.current) {
                    controlsRef.current.stop();
                }
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setError('⚠️ Este código ya existe en la base de datos');
            } else {
                setError('Error al guardar el producto. Verifica la conexión.');
            }
            console.error('Error al guardar:', err);
            
            // Reintentar escaneo después de 2 segundos
            setTimeout(() => {
                setError('');
            }, 2000);
        }
    };

    useEffect(() => {
        let active = true;
        const codeReader = new BrowserMultiFormatReader();

        const startScanner = async () => {
            try {
                if (!videoRef.current) {
                    return;
                }

                const controls = await codeReader.decodeFromVideoDevice(
                    null,
                    videoRef.current,
                    (result, scanError) => {
                        if (!active) {
                            return;
                        }

                        if (result) {
                            guardarProductoEscanado(result.getText());
                            return;
                        }

                        if (scanError && scanError.name !== 'NotFoundException') {
                            setError('No se pudo leer el codigo.');
                        }
                    }
                );

                controlsRef.current = controls;
                setScanning(true);
            } catch (cameraError) {
                setError('No se pudo acceder a la camara. Verifica los permisos.');
            }
        };

        startScanner();

        return () => {
            active = false;
            setScanning(false);
            if (controlsRef.current) {
                controlsRef.current.stop();
            }
        };
    }, [onDetected]);

    return (
        <div className="scanner-overlay" onClick={onClose}>
            <div className="scanner-content" onClick={(e) => e.stopPropagation()}>
                <div className="scanner-header">
                    <h3>
                        <i className="fas fa-camera"></i>
                        Escanear codigo
                    </h3>
                    <button className="scanner-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="scanner-body">
                    <div className="scanner-video-wrapper">
                        <video ref={videoRef} className="scanner-video" />
                        <div className="scanner-frame"></div>
                    </div>

                    {error && (
                        <div className="scanner-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {!error && !scanning && (
                        <p className="scanner-hint">Iniciando camara...</p>
                    )}

                    {scanning && (
                        <p className="scanner-hint">
                            Apunta la camara al codigo de barras.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
