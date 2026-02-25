import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import './Reports.css';

const Reports = ({ productos }) => {
    const [incluirAgotados, setIncluirAgotados] = useState(true);
    const [incluirPrecios, setIncluirPrecios] = useState(true);

    const aplicarFiltros = (datos) => {
        let filtrados = [...datos];

        if (!incluirAgotados) {
            filtrados = filtrados.filter(p => parseInt(p.stock) > 0);
        }

        return filtrados;
    };

    const exportarExcel = () => {
        try {
            if (productos.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            const datos = aplicarFiltros(productos);

            // Preparar datos
            const datosExportacion = datos.map(producto => {
                const fila = {
                    'ID': producto.id,
                    'Producto': producto.nombre,
                    'Código': producto.dni,
                    'Categoría': producto.plan,
                };

                if (incluirPrecios) {
                    fila['Precio ($)'] = parseFloat(producto.fecha_pago).toFixed(2);
                }

                fila['Stock'] = producto.stock;
                fila['Estado'] = producto.estado;

                return fila;
            });

            // Crear workbook
            const ws = XLSX.utils.json_to_sheet(datosExportacion);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

            // Ajustar columnas
            const colWidths = [
                { wch: 8 },
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 12 },
                { wch: 10 },
                { wch: 12 }
            ];
            ws['!cols'] = colWidths;

            // Descargar
            const fecha = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
            XLSX.writeFile(wb, `Inventario_Stocklin_${fecha}.xlsx`);
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            alert('Error al descargar Excel');
        }
    };

    const exportarPDF = () => {
        try {
            if (productos.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            const datos = aplicarFiltros(productos);
            const fecha = new Date().toLocaleDateString('es-ES');
            const hora = new Date().toLocaleTimeString('es-ES');

            let html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
                        <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">
                            📦 Stocklin
                        </h1>
                        <p style="color: #666; margin: 5px 0; font-size: 12px;">Sistema de Gestión de Inventario</p>
                    </div>

                    <div style="margin-bottom: 25px; background: #f0f4ff; padding: 15px; border-radius: 8px;">
                        <h2 style="font-size: 18px; color: #2563eb; margin: 0 0 10px 0;">Reporte de Inventario</h2>
                        <p style="margin: 5px 0; font-size: 12px;">
                            <strong>Fecha:</strong> ${fecha} | <strong>Hora:</strong> ${hora}
                        </p>
                        <p style="margin: 5px 0; font-size: 12px;">
                            <strong>Total de productos:</strong> ${datos.length}
                        </p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
                        <thead>
                            <tr style="background: #3b82f6; color: white;">
                                <th style="border: 1px solid #ddd; padding: 10px;">ID</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Producto</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Código</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Categoría</th>
                                ${incluirPrecios ? '<th style="border: 1px solid #ddd; padding: 10px;">Precio</th>' : ''}
                                <th style="border: 1px solid #ddd; padding: 10px;">Stock</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            datos.forEach((producto, index) => {
                const bgColor = index % 2 === 0 ? '#fff' : '#f9f9f9';
                const stockColor = parseInt(producto.stock) < 5 ? '#fee2e2' : bgColor;

                html += `
                    <tr style="background: ${stockColor};">
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${producto.id}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${producto.nombre}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${producto.dni}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${producto.plan}</td>
                        ${incluirPrecios ? `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${parseFloat(producto.fecha_pago).toFixed(2)}</td>` : ''}
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: 600;">${producto.stock}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                            <span style="padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; 
                                background: ${producto.estado === 'Activo' ? '#d1fae5' : '#fee2e2'}; 
                                color: ${producto.estado === 'Activo' ? '#065f46' : '#991b1b'};">
                                ${producto.estado}
                            </span>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #666;">
                        <p style="margin: 0;">Este documento fue generado automáticamente por Stocklin</p>
                        <p style="margin: 0; font-size: 10px;">Todos los derechos reservados</p>
                    </div>
                </div>
            `;

            const options = {
                margin: 10,
                filename: `Inventario_Stocklin_${new Date().getTime()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
            };

            html2pdf().set(options).from(html).save();
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Error al descargar PDF');
        }
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h2>
                    <i className="fas fa-file-export"></i>
                    Exportar Reportes
                </h2>
                <p>Genera reportes en formato Excel o PDF con los datos del inventario</p>
            </div>

            <div className="reports-options">
                <div className="option-card">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={incluirAgotados}
                            onChange={(e) => setIncluirAgotados(e.target.checked)}
                        />
                        <span>Incluir productos agotados (stock = 0)</span>
                    </label>
                </div>

                <div className="option-card">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={incluirPrecios}
                            onChange={(e) => setIncluirPrecios(e.target.checked)}
                        />
                        <span>Incluir precios en el reporte</span>
                    </label>
                </div>
            </div>

            <div className="export-cards">
                <div className="export-card excel-card" onClick={exportarExcel}>
                    <div className="card-icon">
                        <i className="fas fa-file-excel"></i>
                    </div>
                    <div className="card-content">
                        <h3>Exportar a Excel</h3>
                        <p>Descarga los datos en formato XLSX para análisis</p>
                    </div>
                    <button className="btn btn-success">
                        <i className="fas fa-download"></i>
                        Descargar Excel
                    </button>
                </div>

                <div className="export-card pdf-card" onClick={exportarPDF}>
                    <div className="card-icon">
                        <i className="fas fa-file-pdf"></i>
                    </div>
                    <div className="card-content">
                        <h3>Exportar a PDF</h3>
                        <p>Genera un reporte profesional en formato PDF</p>
                    </div>
                    <button className="btn btn-danger">
                        <i className="fas fa-download"></i>
                        Descargar PDF
                    </button>
                </div>
            </div>

            <div className="reports-stats">
                <div className="stat-item">
                    <i className="fas fa-layer-group"></i>
                    <div>
                        <strong>{productos.length}</strong>
                        <span>Total de productos</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                        <strong>{productos.filter(p => p.estado === 'Activo').length}</strong>
                        <span>Productos activos</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>{productos.filter(p => parseInt(p.stock) < 5).length}</strong>
                        <span>Con stock bajo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
