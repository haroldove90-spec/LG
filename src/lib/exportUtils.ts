import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  FolioSeguimiento,
  Cotizacion,
  OrdenTaller,
  ReporteSitio,
  HojaServicio,
  AgendaContact,
  CompanyInfo,
  ModuleType,
} from '../types';
import { StorageService } from './storage';

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

// Colors for minimalist PDF
const PRIMARY_COLOR: [number, number, number] = [30, 41, 59]; // slate-800
const ACCENT_COLOR: [number, number, number] = [2, 132, 199]; // sky-600
const GRAY_BG: [number, number, number] = [248, 250, 252]; // slate-50
const BORDER_COLOR: [number, number, number] = [226, 232, 240]; // slate-200

export const ExportService = {
  // ==========================================
  // 1. PDF EXPORT - FOLIO DE SEGUIMIENTO
  // ==========================================
  generateFolioSeguimientoPdf(item: FolioSeguimiento, company: CompanyInfo): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(0, 36, pageWidth, 36);

    // Company Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(company.commercialName.toUpperCase(), 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.address} • Tel: ${company.phone}`, 14, 18);
    doc.text(`RFC: ${company.rfc} • ${company.email}`, 14, 23);
    doc.text(company.authorizedCenter, 14, 28);

    // Folio Badge (Right aligned)
    doc.setFillColor(...PRIMARY_COLOR);
    doc.roundedRect(pageWidth - 65, 8, 51, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('FOLIO DE SEGUIMIENTO', pageWidth - 61, 14);
    doc.setFontSize(13);
    doc.text(item.folio, pageWidth - 61, 22);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estado: ${item.estatus}`, pageWidth - 61, 27);

    let startY = 44;

    // Grid 1: Control & Cliente
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        3: { cellWidth: 56 },
      },
      body: [
        ['Fecha de Registro:', item.fecha || 'N/A', 'Número de Orden:', item.numeroOrden || 'N/A'],
        ['Atendió:', item.atendio || 'N/A', 'Cliente:', item.cliente || 'N/A'],
        ['Categoría de Equipo:', item.equipoCategoria || 'N/A', 'Modelo:', item.modelo || 'N/A'],
        ['Número de Serie:', item.serie || 'N/A', 'Vigencia Presupuesto:', item.vigenciaPresupuesto || 'N/A'],
        ['Número de Parte:', item.numeroParte || 'N/A', 'Estatus Actual:', item.estatus || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // Diagnóstico y Trabajos
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Diagnóstico Técnico y Reparación Requerida']],
      body: [[item.reparacionConsisteEn || 'Sin diagnóstico detallado registrado']],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Desglose de Costos de Reparación
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Desglose de Costos de Reparación y Mano de Obra']],
      body: [[item.costosReparacionDesglose || 'Sin desglose registrado']],
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // Resumen Financiero Box
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold', textColor: [71, 85, 105] },
        1: { cellWidth: 48, fontStyle: 'bold', textColor: PRIMARY_COLOR, halign: 'right' },
        2: { cellWidth: 45, fontStyle: 'bold', textColor: [71, 85, 105] },
        3: { cellWidth: 48, fontStyle: 'bold', textColor: ACCENT_COLOR, halign: 'right' },
      },
      body: [
        [
          'Reparación Total:',
          formatCurrency(item.reparacionTotal),
          'Anticipo Requerido (70%):',
          formatCurrency(item.anticipoRequerido),
        ],
        [
          'Revisión Pagada:',
          formatCurrency(item.revisionPagada),
          'Restan a la Reparación:',
          formatCurrency(item.restanReparacion),
        ],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // Observaciones
    if (item.observaciones) {
      autoTable(doc, {
        startY,
        theme: 'grid',
        headStyles: { fillColor: [148, 163, 184], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
        head: [['Observaciones Adicionales y Notas de Recepción']],
        body: [[item.observaciones]],
      });
      startY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Firmas
    const signY = Math.max(startY + 15, 230);
    doc.setDrawColor(148, 163, 184);
    doc.line(25, signY, 85, signY);
    doc.line(125, signY, 185, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('FIRMA / NOMBRE DE CONFORMIDAD CLIENTE', 55, signY + 5, { align: 'center' });
    doc.text('FIRMA TÉCNICO / ASESOR DE SERVICIO', 155, signY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(item.cliente || 'Cliente', 55, signY + 9, { align: 'center' });
    doc.text(item.atendio || 'Personal de Atención', 155, signY + 9, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.text('Este documento es un comprobante de seguimiento y presupuesto técnico oficial. ServiTrack Pro.', 14, 268);

    return doc;
  },

  // ==========================================
  // 2. PDF EXPORT - COTIZACIÓN
  // ==========================================
  generateCotizacionPdf(item: Cotizacion, company: CompanyInfo): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(0, 36, pageWidth, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(company.commercialName.toUpperCase(), 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.address} • Tel: ${company.phone}`, 14, 18);
    doc.text(`RFC: ${company.rfc} • ${company.email}`, 14, 23);
    doc.text(company.authorizedCenter, 14, 28);

    // Badge
    doc.setFillColor(...ACCENT_COLOR);
    doc.roundedRect(pageWidth - 65, 8, 51, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('COTIZACIÓN DE PARTES', pageWidth - 61, 14);
    doc.setFontSize(13);
    doc.text(item.numeroCotizacion, pageWidth - 61, 22);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`REF: ${item.referenciaRef || 'N/A'}`, pageWidth - 61, 27);

    let startY = 44;

    // Info Cliente & Datos
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        3: { cellWidth: 56 },
      },
      body: [
        ['Fecha de Pedido:', item.fechaPedido || 'N/A', 'Estatus Cotización:', item.estatus || 'N/A'],
        ['Atendió:', item.atendio || 'N/A', 'Referencia (REF):', item.referenciaRef || 'N/A'],
        ['Nombre del Cliente:', item.nombreCliente || 'N/A', 'Teléfono / Celular:', `${item.telefono || ''} ${item.celular ? '/ ' + item.celular : ''}`],
        ['Aparato:', item.aparato || 'N/A', 'Marca / Fabricante:', item.marca || 'N/A'],
        ['Modelo (Requerido):', item.modelo || 'N/A', 'Número de Serie:', item.serie || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // Detalle de la Refacción & Costo
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Nombre o Número de Parte Solicitada', 'Importe Cotizado']],
      columnStyles: {
        0: { cellWidth: 136 },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold', textColor: ACCENT_COLOR },
      },
      body: [[item.nombreNumeroParte || 'Sin descripción de pieza', formatCurrency(item.costoRefaccion)]],
    });

    startY = (doc as any).lastAutoTable.finalY + 5;

    // Política de Garantía (Box destacada)
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(248, 113, 113);
    doc.roundedRect(14, startY, pageWidth - 28, 14, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28);
    doc.text('AVISO DE POLÍTICA Y GARANTÍA:', 18, startY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text(item.notaPolitica || 'En piezas eléctricas no hay devolución, ni garantía', 18, startY + 10.5);

    startY += 19;

    // Detalles de Operación y Pedido
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Detalles de la Operación y Logística de Importación']],
      body: [[item.detallesOperacion || 'N/A']],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [100, 116, 139], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Datos del Pedido y Entrega']],
      body: [[item.datosPedido || 'N/A']],
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // Signatures
    const signY = Math.max(startY + 15, 230);
    doc.setDrawColor(148, 163, 184);
    doc.line(25, signY, 85, signY);
    doc.line(125, signY, 185, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('FIRMA / AUTORIZACIÓN CLIENTE', 55, signY + 5, { align: 'center' });
    doc.text('COTIZÓ / ATENDIÓ', 155, signY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(item.nombreCliente || 'Cliente', 55, signY + 9, { align: 'center' });
    doc.text(item.atendio || 'Personal de Atención', 155, signY + 9, { align: 'center' });

    return doc;
  },

  // ==========================================
  // 3. PDF EXPORT - ORDEN TALLER
  // ==========================================
  generateOrdenTallerPdf(item: OrdenTaller, company: CompanyInfo): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(0, 36, pageWidth, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(company.commercialName.toUpperCase(), 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.address} • Tel: ${company.phone}`, 14, 18);
    doc.text(`RFC: ${company.rfc} • ${company.email}`, 14, 23);
    doc.text(company.authorizedCenter, 14, 28);

    // Badge
    doc.setFillColor(15, 118, 110); // teal-700
    doc.roundedRect(pageWidth - 65, 8, 51, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('ORDEN DE TALLER', pageWidth - 61, 14);
    doc.setFontSize(13);
    doc.text(item.numeroOrdenTaller, pageWidth - 61, 22);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estatus: ${item.estatus}`, pageWidth - 61, 27);

    let startY = 44;

    // Cliente & Ubicación
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        3: { cellWidth: 56 },
      },
      body: [
        ['Fecha de Ingreso:', item.fechaIngreso || 'N/A', 'Atendió / Recibió:', item.atendio || 'N/A'],
        ['Nombre del Cliente:', item.nombreCliente || 'N/A', 'Teléfonos:', `${item.telefono || ''} ${item.celular ? '/ ' + item.celular : ''}`],
        ['Dirección:', item.direccion || 'N/A', 'Colonia:', item.colonia || 'N/A'],
        ['Aparato / Equipo:', item.aparato || 'N/A', 'Marca:', item.marca || 'N/A'],
        ['Modelo Code / Versión:', item.modeloCode || 'N/A', 'Número de Serie:', item.serie || 'N/A'],
        ['Técnico Asignado:', item.tecnicoAsignado || 'Sin asignar', '# de Pedido:', item.numeroPedido || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 5;

    // Recepción y Falla
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Falla Reportada por el Cliente al Recibir en Taller']],
      body: [[item.falla || 'Sin reporte']],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Accesorios Recibidos / Estado Físico y Observaciones']],
      body: [[item.accesoriosObservaciones || 'Sin accesorios registrados']],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Presupuesto y Partes
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      columnStyles: {
        0: { cellWidth: 136 },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold', textColor: [15, 118, 110] },
      },
      head: [['Refacciones Requeridas para Taller', 'Presupuesto Estimado']],
      body: [[item.refacciones || 'Sin refacciones especificadas', formatCurrency(item.presupuesto)]],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Info Confidencial (si existe)
    if (item.informacionConfidencial) {
      autoTable(doc, {
        startY,
        theme: 'grid',
        headStyles: { fillColor: [180, 83, 9], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [146, 64, 14], fillColor: [254, 243, 199] },
        head: [['Información Confidencial / Notas Internas de Taller (Área Restringida)']],
        body: [[item.informacionConfidencial]],
      });
      startY = (doc as any).lastAutoTable.finalY + 4;
    }

    // Signatures
    const signY = Math.max(startY + 15, 230);
    doc.setDrawColor(148, 163, 184);
    doc.line(25, signY, 85, signY);
    doc.line(125, signY, 185, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('FIRMA / ACEPTACIÓN CLIENTE', 55, signY + 5, { align: 'center' });
    doc.text('TÉCNICO / RESPONSABLE TALLER', 155, signY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(item.nombreCliente || 'Cliente', 55, signY + 9, { align: 'center' });
    doc.text(item.tecnicoAsignado || item.atendio || 'Taller Central', 155, signY + 9, { align: 'center' });

    return doc;
  },

  // ==========================================
  // 4. PDF EXPORT - REPORTE DE SERVICIO EN SITIO
  // ==========================================
  generateReporteSitioPdf(item: ReporteSitio, company: CompanyInfo): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(0, 36, pageWidth, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(company.commercialName.toUpperCase(), 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.address} • Tel: ${company.phone}`, 14, 18);
    doc.text(`RFC: ${company.rfc} • ${company.email}`, 14, 23);
    doc.text(company.authorizedCenter, 14, 28);

    // Badge
    doc.setFillColor(124, 58, 237); // violet-600
    doc.roundedRect(pageWidth - 65, 8, 51, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('SERVICIO EN SITIO', pageWidth - 61, 14);
    doc.setFontSize(13);
    doc.text(item.numeroReporte, pageWidth - 61, 22);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo: ${item.tipoServicio}`, pageWidth - 61, 27);

    let startY = 44;

    // Cliente & Domicilio
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        3: { cellWidth: 56 },
      },
      body: [
        ['Fecha de Reporte:', item.fechaReporte || 'N/A', 'Atendió Solicitud:', item.atendio || 'N/A'],
        ['Nombre del Cliente:', item.nombreCliente || 'N/A', 'Tipo de Inmueble:', item.tipoCasa || 'N/A'],
        ['Dirección y Referencias:', item.direccion || 'N/A', 'Colonia:', item.colonia || 'N/A'],
        ['Teléfono / Celular:', `${item.telefono || ''} ${item.celular ? '/ ' + item.celular : ''}`, 'Orden de Servicio:', item.numeroOrdenServicio || 'N/A'],
        ['Aparato / Marca:', `${item.aparato || ''} ${item.marca ? '• ' + item.marca : ''}`, 'Modelo:', item.modelo || 'N/A'],
        ['Serie Difusor:', item.serieDifusor || 'N/A', 'Serie Equipo:', item.serieEquipo || 'N/A'],
        ['Fecha y Hora Visita:', `${item.fechaVisita || 'N/A'} ${item.horaVisita ? '• ' + item.horaVisita : ''}`, 'Técnico en Sitio:', item.tecnico || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 5;

    // Falla
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Falla Reportada por el Cliente']],
      body: [[item.fallaReportada || 'N/A']],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Visitas
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Visita', 'Detalles Técnicos y Acciones Realizadas en Domicilio']],
      columnStyles: { 0: { cellWidth: 30, fontStyle: 'bold' }, 1: { cellWidth: 156 } },
      body: [
        ['1ª Visita:', item.detalles1erVisita || 'Sin registro'],
        ['2ª Visita:', item.detalles2daVisita || 'N/A'],
        ['3ª Visita:', item.detalles3eraVisita || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Partes & Presupuesto
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        3: { cellWidth: 56, fontStyle: 'bold', textColor: [124, 58, 237], halign: 'right' },
      },
      body: [
        ['Partes Solicitadas:', item.partesSolicitadas || 'N/A', 'Presupuesto Total:', typeof item.presupuesto === 'number' ? formatCurrency(item.presupuesto) : (item.presupuesto || 'N/A')],
        ['# de Pedido:', item.numeroPedido || 'N/A', 'Observaciones:', item.observaciones || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Información Confidencial (si existe)
    if (item.informacionConfidencial) {
      autoTable(doc, {
        startY,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [20, 83, 45], fillColor: [240, 253, 244] },
        head: [['Información Confidencial / Accesos y Referencias']],
        body: [[item.informacionConfidencial]],
      });
      startY = (doc as any).lastAutoTable.finalY + 4;
    }

    // Signatures
    const signY = Math.max(startY + 10, 230);
    doc.setDrawColor(148, 163, 184);
    doc.line(25, signY, 85, signY);
    doc.line(125, signY, 185, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('FIRMA / RECEPCIÓN CLIENTE EN SITIO', 55, signY + 5, { align: 'center' });
    doc.text('FIRMA TÉCNICO EN SITIO', 155, signY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(item.nombreCliente || 'Cliente', 55, signY + 9, { align: 'center' });
    doc.text(item.tecnico || 'Técnico Especialista', 155, signY + 9, { align: 'center' });

    return doc;
  },

  // ==========================================
  // 5. PDF EXPORT - HOJA DE SERVICIO OFICIAL
  // ==========================================
  generateHojaServicioPdf(item: HojaServicio, company: CompanyInfo): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(0, 36, pageWidth, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(company.commercialName.toUpperCase(), 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.address} • Tel: ${company.phone}`, 14, 17);
    doc.text(`RFC: ${company.rfc} • ${company.email}`, 14, 21);
    doc.text(`CAS Autorizado: ${item.centroServicioAutorizado || company.authorizedCenter}`, 14, 25);
    doc.text(`Garantía: ${item.garantia} • Val: ${item.validacionGarantia}`, 14, 29);

    // Badge
    doc.setFillColor(225, 29, 72); // rose-600
    doc.roundedRect(pageWidth - 65, 8, 51, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('HOJA DE SERVICIO OFICIAL', pageWidth - 61, 14);
    doc.setFontSize(12);
    doc.text(item.folioLGEMS, pageWidth - 61, 21);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo: ${item.tipoServicio}`, pageWidth - 61, 26);
    doc.text(`F. Ent: ${item.fechaEntrega || item.fechaFinAtencion || 'En proceso'}`, pageWidth - 61, 30);

    let startY = 42;

    // Fechas clave
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 2, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 28, fillColor: [241, 245, 249] },
        1: { cellWidth: 34 },
        2: { fontStyle: 'bold', cellWidth: 28, fillColor: [241, 245, 249] },
        3: { cellWidth: 34 },
        4: { fontStyle: 'bold', cellWidth: 28, fillColor: [241, 245, 249] },
        5: { cellWidth: 34 },
      },
      body: [
        ['F. Recepción:', item.fechaRecepcion || 'N/A', 'F. Requerida:', item.fechaRequerida || 'N/A', 'F. Inicio:', item.fechaInicioAtencion || 'N/A'],
        ['F. Fin Atención:', item.fechaFinAtencion || 'N/A', 'F. Entrega:', item.fechaEntrega || 'N/A', 'Garantía:', item.garantia || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 3;

    // Cliente & Producto
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 2, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 32, fillColor: [241, 245, 249] },
        1: { cellWidth: 62 },
        2: { fontStyle: 'bold', cellWidth: 32, fillColor: [241, 245, 249] },
        3: { cellWidth: 60 },
      },
      body: [
        ['Nombre Cliente:', item.nombreCompleto || 'N/A', 'Teléfonos:', `${item.telefonoFijo || ''} ${item.celular ? '/ ' + item.celular : ''}`],
        ['Domicilio Completo:', `${item.domicilioCompleto || ''}, ${item.colonia || ''}`, 'Ciudad / Estado / CP:', `${item.ciudad || ''}, ${item.estado || ''} C.P. ${item.codigoPostal || ''}`],
        ['Tipo de Producto:', item.tipoProducto || 'N/A', 'Modelo:', item.modelo || 'N/A'],
        ['Número de Serie:', item.numeroSerie || 'N/A', 'Distribuidor / Compra:', `${item.distribuidor || 'N/A'} (${item.fechaCompra || 'S/F'})`],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 3;

    // Validaciones Técnicas & Condiciones
    const condList: string[] = [];
    if (item.condicionesFisicas) {
      if (item.condicionesFisicas.golpesRayones) condList.push('Golpes/Rayones');
      if (item.condicionesFisicas.faltanTornillos) condList.push('Faltan tornillos');
      if (item.condicionesFisicas.intervenidoTerceros) condList.push('Intervenido por terceros');
      if (item.condicionesFisicas.humedadOxido) condList.push('Humedad/Óxido');
      if (item.condicionesFisicas.cablesDañados) condList.push('Cables dañados');
      if (item.condicionesFisicas.limpioYCompleto) condList.push('Limpio y completo');
    }

    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7, cellPadding: 2, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Parámetros Técnicos en Domicilio', 'Condición Física Inicial del Equipo']],
      body: [
        [
          `¿Tierra física?: ${item.hayTierraFisica || 'N/A'} | Voltaje: ${item.voltajeDomicilio || 'N/A'}\nPresión Agua: ${item.presionAguaPSI || 'N/A'} | Presión Gas: ${item.presionGas || 'N/A'}`,
          `Checklist: ${condList.length > 0 ? condList.join(', ') : 'Sin observaciones especiales'}\n${item.condicionesFisicas?.detallesExtras || ''}`,
        ],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 3;

    // Falla & Diagnóstico
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7, cellPadding: 2, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Síntoma / Falla Reportada', 'Diagnóstico Técnico y Observaciones de Servicio']],
      body: [[item.sintomaFallaReportada || 'N/A', item.observacionesDiagnostico || 'N/A']],
    });

    startY = (doc as any).lastAutoTable.finalY + 3;

    // Refacciones Utilizadas
    const refRows = (item.refacciones || []).map((r) => [
      r.numeroParte || 'N/A',
      r.descripcion || 'N/A',
      String(r.cantidad || 1),
      formatCurrency(r.monto),
      formatCurrency((r.cantidad || 1) * (r.monto || 0)),
    ]);

    if (refRows.length === 0) {
      refRows.push(['Sin refacciones', 'No se utilizaron partes para esta orden', '0', '$0.00', '$0.00']);
    }

    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7, cellPadding: 1.8, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 80 },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
      head: [['No. Parte', 'Descripción de Refacción', 'Cant.', 'Precio Unit.', 'Importe']],
      body: refRows,
    });

    startY = (doc as any).lastAutoTable.finalY + 3;

    // Liquidación Financiera
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold', fillColor: [241, 245, 249] },
        1: { cellWidth: 48, halign: 'right' },
        2: { cellWidth: 45, fontStyle: 'bold', fillColor: [241, 245, 249] },
        3: { cellWidth: 48, halign: 'right' },
      },
      body: [
        ['Mano de Obra:', formatCurrency(item.manoDeObra), 'Repuestos:', formatCurrency(item.repuestosMonto)],
        ['Transporte / Viáticos:', formatCurrency(item.transporte), `IVA (${item.ivaPorcentaje || 16}%):`, formatCurrency(item.ivaMonto)],
        ['Visita / Diagnóstico:', formatCurrency(item.visita), 'TOTAL:', formatCurrency(item.total)],
        [
          `¿Pagó?: ${item.realizoPago} (${item.motivoPago})`,
          `Cobrado: ${formatCurrency(item.cantidadPagada)}`,
          'Saldo Pendiente:',
          formatCurrency(Math.max(0, (item.total || 0) - (item.cantidadPagada || 0))),
        ],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 4;

    // Firmas Digitales (con soporte de imagen de firma si está dibujada)
    const signY = Math.max(startY + 4, 235);
    const boxW = 80;
    const boxH = 20;

    // Draw signatures or line
    if (item.firmaClienteDataUrl && item.firmaClienteDataUrl.startsWith('data:image')) {
      try {
        doc.addImage(item.firmaClienteDataUrl, 'PNG', 15, signY - 14, 50, 14);
      } catch (e) {
        console.error(e);
      }
    }
    if (item.firmaTecnicoDataUrl && item.firmaTecnicoDataUrl.startsWith('data:image')) {
      try {
        doc.addImage(item.firmaTecnicoDataUrl, 'PNG', 120, signY - 14, 50, 14);
      } catch (e) {
        console.error(e);
      }
    }

    doc.setDrawColor(148, 163, 184);
    doc.line(15, signY, 95, signY);
    doc.line(115, signY, 195, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('NOMBRE Y FIRMA DEL CLIENTE', 55, signY + 4, { align: 'center' });
    doc.text('NOMBRE Y FIRMA DEL TÉCNICO', 155, signY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.nombreClienteFirma || item.nombreCompleto || 'Cliente', 55, signY + 7.5, { align: 'center' });
    doc.text(item.nombreTecnico || item.tecnicoAsignado || 'Técnico Especialista', 155, signY + 7.5, { align: 'center' });

    return doc;
  },

  // ==========================================
  // 6. PDF EXPORT - FICHA DE AGENDA / CONTACTO
  // ==========================================
  generateAgendaPdf(item: AgendaContact, company: CompanyInfo): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(0, 36, pageWidth, 36);

    // Company Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text((company.commercialName || 'Centro de Servicio Autorizado').toUpperCase(), 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.address || ''} • Tel: ${company.phone || ''}`, 14, 18);
    doc.text(`RFC: ${company.rfc || ''} • ${company.email || ''}`, 14, 23);
    doc.text(company.authorizedCenter || 'Directorio Técnico y de Proveedores', 14, 28);

    // Badge
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.roundedRect(pageWidth - 65, 8, 51, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('FICHA DE AGENDA', pageWidth - 61, 14);
    doc.setFontSize(13);
    doc.text(`ID #${item.agendaId}`, pageWidth - 61, 22);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Control de Directorio`, pageWidth - 61, 27);

    let startY = 44;

    // Nombre Box
    autoTable(doc, {
      startY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 10, fontStyle: 'bold', cellPadding: 3.5, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
      head: [['Nombre / Contacto / Programa Técnico']],
      body: [[item.nombre || 'Sin nombre registrado']],
    });

    startY = (doc as any).lastAutoTable.finalY + 5;

    // Grid Comunicaciones
    autoTable(doc, {
      startY,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: PRIMARY_COLOR },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35, fillColor: [241, 245, 249] },
        3: { cellWidth: 56 },
      },
      body: [
        ['Teléfono Fijo:', item.telefono || 'N/A', 'Extensión:', item.extension || 'N/A'],
        ['Móvil (Celular):', item.movil || 'N/A', 'Fax:', item.fax || 'N/A'],
        ['Correo Electrónico:', item.correoElectronico || 'N/A', 'Organización / Área:', item.organizacion || 'N/A'],
      ],
    });

    startY = (doc as any).lastAutoTable.finalY + 5;

    // Cargo / Enlace
    if (item.cargo) {
      autoTable(doc, {
        startY,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 8.5, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
        head: [['Cargo / Puesto / Enlace Técnico']],
        body: [[item.cargo]],
      });
      startY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Información Adicional
    if (item.informacionAdicional) {
      autoTable(doc, {
        startY,
        theme: 'grid',
        headStyles: { fillColor: [148, 163, 184], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 3, textColor: PRIMARY_COLOR, lineColor: BORDER_COLOR },
        head: [['Información Adicional / Ubicación y Referencias']],
        body: [[item.informacionAdicional]],
      });
      startY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Footer
    const signY = Math.max(startY + 15, 240);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`${company.name} • RFC: ${company.rfc} • Documento oficial de directorio.`, 14, 268);

    return doc;
  },

  // Generic PDF Dispatcher
  exportToPdf(module: ModuleType, record: any): void {
    const company = StorageService.getCompany();
    let doc: jsPDF;
    let filename = '';

    switch (module) {
      case 'agenda':
        doc = this.generateAgendaPdf(record as AgendaContact, company);
        filename = `Agenda_${record.agendaId || 'Contacto'}.pdf`;
        break;
      case 'folio_seguimiento':
        doc = this.generateFolioSeguimientoPdf(record as FolioSeguimiento, company);
        filename = `${record.folio || 'Folio'}_Seguimiento.pdf`;
        break;
      case 'cotizacion':
        doc = this.generateCotizacionPdf(record as Cotizacion, company);
        filename = `${record.numeroCotizacion || 'Cotizacion'}.pdf`;
        break;
      case 'orden_taller':
        doc = this.generateOrdenTallerPdf(record as OrdenTaller, company);
        filename = `${record.numeroOrdenTaller || 'OrdenTaller'}.pdf`;
        break;
      case 'reporte_sitio':
        doc = this.generateReporteSitioPdf(record as ReporteSitio, company);
        filename = `${record.numeroReporte || 'ReporteSitio'}.pdf`;
        break;
      case 'hoja_servicio':
        doc = this.generateHojaServicioPdf(record as HojaServicio, company);
        filename = `${record.folioLGEMS || 'HojaServicio'}.pdf`;
        break;
    }

    doc.save(filename);
  },

  // ==========================================
  // EXCEL EXPORT (INDIVIDUAL AND BULK LISTS)
  // ==========================================
  exportRecordToExcel(module: ModuleType, record: any): void {
    const company = StorageService.getCompany();
    let data: any[] = [];
    let sheetName = '';
    let fileName = '';

    switch (module) {
      case 'folio_seguimiento': {
        const f = record as FolioSeguimiento;
        sheetName = 'Folio_Seguimiento';
        fileName = `${f.folio || 'Folio'}.xlsx`;
        data = [
          { 'CAMPO': 'EMPRESA', 'VALOR': company.name },
          { 'CAMPO': 'FOLIO', 'VALOR': f.folio },
          { 'CAMPO': 'ESTATUS', 'VALOR': f.estatus },
          { 'CAMPO': 'FECHA', 'VALOR': f.fecha },
          { 'CAMPO': 'ATENDIÓ', 'VALOR': f.atendio },
          { 'CAMPO': 'NÚMERO DE ORDEN', 'VALOR': f.numeroOrden },
          { 'CAMPO': 'CLIENTE', 'VALOR': f.cliente },
          { 'CAMPO': 'EQUIPO', 'VALOR': f.equipoCategoria },
          { 'CAMPO': 'MODELO', 'VALOR': f.modelo },
          { 'CAMPO': 'SERIE', 'VALOR': f.serie },
          { 'CAMPO': 'DIAGNÓSTICO Y TRABAJOS', 'VALOR': f.reparacionConsisteEn },
          { 'CAMPO': 'DESGLOSE DE COSTOS', 'VALOR': f.costosReparacionDesglose },
          { 'CAMPO': 'REPARACIÓN TOTAL ($)', 'VALOR': f.reparacionTotal },
          { 'CAMPO': 'REVISIÓN PAGADA ($)', 'VALOR': f.revisionPagada },
          { 'CAMPO': 'ANTICIPO REQUERIDO (70%) ($)', 'VALOR': f.anticipoRequerido },
          { 'CAMPO': 'RESTAN A LA REPARACIÓN ($)', 'VALOR': f.restanReparacion },
          { 'CAMPO': 'VIGENCIA PRESUPUESTO', 'VALOR': f.vigenciaPresupuesto },
          { 'CAMPO': 'NÚMERO DE PARTE', 'VALOR': f.numeroParte },
          { 'CAMPO': 'OBSERVACIONES', 'VALOR': f.observaciones },
        ];
        break;
      }
      case 'cotizacion': {
        const c = record as Cotizacion;
        sheetName = 'Cotizacion';
        fileName = `${c.numeroCotizacion || 'Cotizacion'}.xlsx`;
        data = [
          { 'CAMPO': 'EMPRESA', 'VALOR': company.name },
          { 'CAMPO': 'NO. COTIZACIÓN', 'VALOR': c.numeroCotizacion },
          { 'CAMPO': 'REFERENCIA (REF)', 'VALOR': c.referenciaRef },
          { 'CAMPO': 'ESTATUS', 'VALOR': c.estatus },
          { 'CAMPO': 'FECHA DE PEDIDO', 'VALOR': c.fechaPedido },
          { 'CAMPO': 'ATENDIÓ', 'VALOR': c.atendio },
          { 'CAMPO': 'NOMBRE DEL CLIENTE', 'VALOR': c.nombreCliente },
          { 'CAMPO': 'TELÉFONO', 'VALOR': c.telefono },
          { 'CAMPO': 'CELULAR', 'VALOR': c.celular },
          { 'CAMPO': 'APARATO', 'VALOR': c.aparato },
          { 'CAMPO': 'MARCA', 'VALOR': c.marca },
          { 'CAMPO': 'MODELO', 'VALOR': c.modelo },
          { 'CAMPO': 'SERIE', 'VALOR': c.serie },
          { 'CAMPO': 'NOMBRE O NO. DE PARTE', 'VALOR': c.nombreNumeroParte },
          { 'CAMPO': 'NOTA DE POLÍTICA', 'VALOR': c.notaPolitica },
          { 'CAMPO': 'DETALLES DE LA OPERACIÓN', 'VALOR': c.detallesOperacion },
          { 'CAMPO': 'COSTO DE LA REFACCIÓN ($)', 'VALOR': c.costoRefaccion },
          { 'CAMPO': 'DATOS DEL PEDIDO', 'VALOR': c.datosPedido },
        ];
        break;
      }
      case 'orden_taller': {
        const o = record as OrdenTaller;
        sheetName = 'Orden_Taller';
        fileName = `${o.numeroOrdenTaller || 'OrdenTaller'}.xlsx`;
        data = [
          { 'CAMPO': 'EMPRESA', 'VALOR': company.name },
          { 'CAMPO': 'ORDEN TALLER', 'VALOR': o.numeroOrdenTaller },
          { 'CAMPO': 'ESTATUS DE ORDEN', 'VALOR': o.estatus },
          { 'CAMPO': 'FECHA DE INGRESO', 'VALOR': o.fechaIngreso },
          { 'CAMPO': 'ATENDIÓ', 'VALOR': o.atendio },
          { 'CAMPO': 'NOMBRE DEL CLIENTE', 'VALOR': o.nombreCliente },
          { 'CAMPO': 'DIRECCIÓN', 'VALOR': o.direccion },
          { 'CAMPO': 'COLONIA', 'VALOR': o.colonia },
          { 'CAMPO': 'TELÉFONO', 'VALOR': o.telefono },
          { 'CAMPO': 'CELULAR', 'VALOR': o.celular },
          { 'CAMPO': 'APARATO', 'VALOR': o.aparato },
          { 'CAMPO': 'MARCA', 'VALOR': o.marca },
          { 'CAMPO': 'MODELO CODE / VERSIÓN', 'VALOR': o.modeloCode },
          { 'CAMPO': 'SERIE', 'VALOR': o.serie },
          { 'CAMPO': 'FALLA', 'VALOR': o.falla },
          { 'CAMPO': 'ACCESORIOS / OBSERVACIONES', 'VALOR': o.accesoriosObservaciones },
          { 'CAMPO': 'TÉCNICO ASIGNADO', 'VALOR': o.tecnicoAsignado },
          { 'CAMPO': 'PRESUPUESTO ($)', 'VALOR': o.presupuesto },
          { 'CAMPO': 'REFACCIONES', 'VALOR': o.refacciones },
          { 'CAMPO': '# DE PEDIDO', 'VALOR': o.numeroPedido },
          { 'CAMPO': 'INFORMACIÓN CONFIDENCIAL', 'VALOR': o.informacionConfidencial },
        ];
        break;
      }
      case 'reporte_sitio': {
        const r = record as ReporteSitio;
        sheetName = 'Reporte_Sitio';
        fileName = `${r.numeroReporte || 'ReporteSitio'}.xlsx`;
        data = [
          { 'CAMPO': 'EMPRESA', 'VALOR': company.name },
          { 'CAMPO': '# DE REPORTE', 'VALOR': r.numeroReporte },
          { 'CAMPO': 'TIPO DE SERVICIO', 'VALOR': r.tipoServicio },
          { 'CAMPO': 'FECHA DE REPORTE', 'VALOR': r.fechaReporte },
          { 'CAMPO': 'ATENDIÓ', 'VALOR': r.atendio },
          { 'CAMPO': 'NOMBRE DEL CLIENTE', 'VALOR': r.nombreCliente },
          { 'CAMPO': 'DIRECCIÓN', 'VALOR': r.direccion },
          { 'CAMPO': 'COLONIA', 'VALOR': r.colonia },
          { 'CAMPO': 'TIPO DE CASA', 'VALOR': r.tipoCasa },
          { 'CAMPO': 'TELÉFONO', 'VALOR': r.telefono },
          { 'CAMPO': 'CELULAR', 'VALOR': r.celular },
          { 'CAMPO': 'APARATO', 'VALOR': r.aparato },
          { 'CAMPO': 'MARCA', 'VALOR': r.marca },
          { 'CAMPO': 'MODELO', 'VALOR': r.modelo },
          { 'CAMPO': 'SERIE DEL DIFUSOR', 'VALOR': r.serieDifusor },
          { 'CAMPO': 'SERIE DEL EQUIPO', 'VALOR': r.serieEquipo },
          { 'CAMPO': 'FALLA REPORTADA', 'VALOR': r.fallaReportada },
          { 'CAMPO': 'FECHA DE VISITA', 'VALOR': r.fechaVisita },
          { 'CAMPO': 'HORA DE VISITA', 'VALOR': r.horaVisita },
          { 'CAMPO': 'TÉCNICO', 'VALOR': r.tecnico },
          { 'CAMPO': 'DETALLES 1RA VISITA', 'VALOR': r.detalles1erVisita },
          { 'CAMPO': 'DETALLES 2DA VISITA', 'VALOR': r.detalles2daVisita },
          { 'CAMPO': 'DETALLES 3RA VISITA', 'VALOR': r.detalles3eraVisita },
          { 'CAMPO': 'PRESUPUESTO ($)', 'VALOR': r.presupuesto },
          { 'CAMPO': 'PARTES SOLICITADAS', 'VALOR': r.partesSolicitadas },
          { 'CAMPO': '# DE PEDIDO', 'VALOR': r.numeroPedido },
          { 'CAMPO': 'OBSERVACIONES', 'VALOR': r.observaciones },
          { 'CAMPO': 'NO. ORDEN DE SERVICIO', 'VALOR': r.numeroOrdenServicio },
          { 'CAMPO': 'INFORMACIÓN CONFIDENCIAL', 'VALOR': r.informacionConfidencial },
        ];
        break;
      }
      case 'hoja_servicio': {
        const h = record as HojaServicio;
        sheetName = 'Hoja_Servicio';
        fileName = `${h.folioLGEMS || 'HojaServicio'}.xlsx`;
        data = [
          { 'CAMPO': 'EMPRESA', 'VALOR': company.name },
          { 'CAMPO': 'NO. DE ORDEN / FOLIO LGEMS', 'VALOR': h.folioLGEMS },
          { 'CAMPO': 'CENTRO DE SERVICIO AUTORIZADO', 'VALOR': h.centroServicioAutorizado },
          { 'CAMPO': 'TIPO DE SERVICIO', 'VALOR': h.tipoServicio },
          { 'CAMPO': 'GARANTÍA', 'VALOR': h.garantia },
          { 'CAMPO': 'F. RECEPCIÓN', 'VALOR': h.fechaRecepcion },
          { 'CAMPO': 'F. REQUERIDA', 'VALOR': h.fechaRequerida },
          { 'CAMPO': 'F. INICIO ATENCIÓN', 'VALOR': h.fechaInicioAtencion },
          { 'CAMPO': 'F. FIN ATENCIÓN', 'VALOR': h.fechaFinAtencion },
          { 'CAMPO': 'F. ENTREGA', 'VALOR': h.fechaEntrega },
          { 'CAMPO': 'CLIENTE', 'VALOR': h.nombreCompleto },
          { 'CAMPO': 'DOMICILIO', 'VALOR': h.domicilioCompleto },
          { 'CAMPO': 'COLONIA', 'VALOR': h.colonia },
          { 'CAMPO': 'CIUDAD / ESTADO / CP', 'VALOR': `${h.ciudad}, ${h.estado} CP ${h.codigoPostal}` },
          { 'CAMPO': 'TELÉFONOS', 'VALOR': `${h.telefonoFijo} / ${h.celular}` },
          { 'CAMPO': 'PRODUCTO / MODELO', 'VALOR': `${h.tipoProducto} / ${h.modelo}` },
          { 'CAMPO': 'NO. DE SERIE', 'VALOR': h.numeroSerie },
          { 'CAMPO': 'DISTRIBUIDOR / COMPRA', 'VALOR': `${h.distribuidor} (${h.fechaCompra})` },
          { 'CAMPO': 'SÍNTOMA / FALLA', 'VALOR': h.sintomaFallaReportada },
          { 'CAMPO': 'OBSERVACIONES DIAGNÓSTICO', 'VALOR': h.observacionesDiagnostico },
          { 'CAMPO': 'TIERRA FÍSICA', 'VALOR': h.hayTierraFisica },
          { 'CAMPO': 'VOLTAJE (V)', 'VALOR': h.voltajeDomicilio },
          { 'CAMPO': 'PRESIÓN AGUA (PSI)', 'VALOR': h.presionAguaPSI },
          { 'CAMPO': 'PRESIÓN GAS', 'VALOR': h.presionGas },
          { 'CAMPO': 'TÉCNICO ASIGNADO', 'VALOR': h.tecnicoAsignado },
          { 'CAMPO': 'MANO DE OBRA ($)', 'VALOR': h.manoDeObra },
          { 'CAMPO': 'TRANSPORTE ($)', 'VALOR': h.transporte },
          { 'CAMPO': 'VISITA ($)', 'VALOR': h.visita },
          { 'CAMPO': 'MATERIALES ($)', 'VALOR': h.materiales },
          { 'CAMPO': 'REPUESTOS ($)', 'VALOR': h.repuestosMonto },
          { 'CAMPO': 'IVA (%)', 'VALOR': h.ivaPorcentaje },
          { 'CAMPO': 'IVA ($)', 'VALOR': h.ivaMonto },
          { 'CAMPO': 'TOTAL ($)', 'VALOR': h.total },
          { 'CAMPO': 'PAGÓ', 'VALOR': h.realizoPago },
          { 'CAMPO': 'CANTIDAD PAGADA ($)', 'VALOR': h.cantidadPagada },
          { 'CAMPO': 'MOTIVO PAGO', 'VALOR': h.motivoPago },
          { 'CAMPO': 'VALIDACIÓN GARANTÍA', 'VALOR': h.validacionGarantia },
        ];
        break;
      }
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // If Hoja de Servicio has refacciones table, add as second sheet
    if (module === 'hoja_servicio' && record.refacciones && record.refacciones.length > 0) {
      const refData = record.refacciones.map((r: any) => ({
        'NO. PARTE': r.numeroParte,
        'DESCRIPCIÓN': r.descripcion,
        'CANTIDAD': r.cantidad,
        'MONTO UNITARIO ($)': r.monto,
        'TOTAL ($)': (r.cantidad || 1) * (r.monto || 0),
      }));
      const wsRef = XLSX.utils.json_to_sheet(refData);
      XLSX.utils.book_append_sheet(wb, wsRef, 'Refacciones_Detalle');
    }

    XLSX.writeFile(wb, fileName);
  },

  // Bulk export entire module list to Excel table
  exportModuleListToExcel(module: ModuleType): void {
    let rawList: any[] = [];
    let fileName = '';
    let sheetName = '';

    switch (module) {
      case 'folio_seguimiento':
        rawList = StorageService.getFolios();
        fileName = 'Listado_Folios_Seguimiento.xlsx';
        sheetName = 'Folios';
        break;
      case 'cotizacion':
        rawList = StorageService.getCotizaciones();
        fileName = 'Listado_Cotizaciones.xlsx';
        sheetName = 'Cotizaciones';
        break;
      case 'orden_taller':
        rawList = StorageService.getOrdenesTaller();
        fileName = 'Listado_Ordenes_Taller.xlsx';
        sheetName = 'Ordenes_Taller';
        break;
      case 'reporte_sitio':
        rawList = StorageService.getReportesSitio();
        fileName = 'Listado_Reportes_Sitio.xlsx';
        sheetName = 'Reportes_Sitio';
        break;
      case 'hoja_servicio':
        rawList = StorageService.getHojasServicio();
        fileName = 'Listado_Hojas_Servicio.xlsx';
        sheetName = 'Hojas_Servicio';
        break;
    }

    const ws = XLSX.utils.json_to_sheet(rawList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  },
};
