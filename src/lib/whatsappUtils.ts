import { ModuleType, AnyRecord, CompanyInfo, ReporteSitio, Cotizacion, OrdenTaller, FolioSeguimiento, AgendaContact } from '../types';
import { ExportService } from './exportUtils';

const formatCurrency = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '$0.00 MXN';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '$0.00 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
};

// Limpia el número telefónico para WhatsApp
export const cleanPhoneNumber = (phone?: string): string => {
  if (!phone) return '';
  // Deja solo números
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // Si tiene 10 dígitos (México), antepone el código de país 52
  if (digits.length === 10) {
    return `52${digits}`;
  }
  return digits;
};

// Genera un texto con formato profesional de WhatsApp (usando asteriscos para negritas, emojis y saltos)
export const formatRecordForWhatsApp = (
  module: ModuleType,
  record: AnyRecord,
  company: CompanyInfo
): { message: string; phone: string; folio: string; title: string } => {
  let message = '';
  let phone = '';
  let folio = '';
  let title = '';

  const header = `🏢 *${company.commercialName || 'ELECTRO INDUSTRIAS'}*\n_${company.authorizedCenter || 'Servicio Técnico Especializado'}_\n📍 ${company.address || ''} • 📞 ${company.phone || ''}\n━━━━━━━━━━━━━━━━━━━━━\n`;

  if (module === 'reporte_sitio') {
    const item = record as ReporteSitio;
    folio = item.numeroReporte || 'S/F';
    title = `Reporte de Servicio #${folio}`;
    phone = cleanPhoneNumber(item.celular || item.telefono);

    message = `${header}📋 *REPORTE DE SERVICIO EN SITIO* • *#${folio}*\n\n` +
      `👤 *Cliente:* ${item.nombreCliente || 'N/A'}\n` +
      `📞 *Contacto:* ${item.telefono || ''} ${item.celular ? '• ' + item.celular : ''}\n` +
      `🏠 *Domicilio:* ${item.direccion || 'N/A'}, ${item.colonia || ''}\n` +
      `📅 *Fecha de Visita:* ${item.fechaVisita || 'Por definir'} (${item.horaVisita || 'En el transcurso del día'})\n` +
      `🛠️ *Técnico Asignado:* ${item.tecnico || 'Por asignar'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚙️ *DATOS DEL EQUIPO*\n` +
      `• *Aparato:* ${item.aparato || 'N/A'}\n` +
      `• *Marca / Modelo:* ${item.marca || ''} ${item.modelo ? '/ ' + item.modelo : ''}\n` +
      `• *Serie:* ${item.serieEquipo || item.serieDifusor || 'N/A'}\n` +
      `• *Falla Reportada:* ${item.fallaReportada || 'N/A'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *PRESUPUESTO ESTIMADO:* *${formatCurrency(item.presupuesto)}*\n` +
      (item.partesSolicitadas ? `🔩 *Partes / Refacciones:* ${item.partesSolicitadas}\n` : '') +
      (item.observaciones ? `📝 *Observaciones:* ${item.observaciones}\n` : '') +
      `\n_Documento emitido por ${company.commercialName}. ¡Agradecemos su preferencia!_`;
  } else if (module === 'cotizacion') {
    const item = record as Cotizacion;
    folio = item.numeroCotizacion || 'S/F';
    title = `Cotización #${folio}`;
    phone = cleanPhoneNumber(item.celular || item.telefono);

    message = `${header}📄 *COTIZACIÓN DE REFACCIONES & PEDIDO* • *#${folio}*\n\n` +
      `👤 *Cliente:* ${item.nombreCliente || 'N/A'}\n` +
      `📞 *Contacto:* ${item.telefono || ''} ${item.celular ? '• ' + item.celular : ''}\n` +
      `📅 *Fecha:* ${item.fechaPedido || 'N/A'}\n` +
      `🏷️ *Estatus:* *${item.estatus || 'COTIZADO'}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚙️ *EQUIPO & REFACCIÓN SOLICITADA*\n` +
      `• *Aparato:* ${item.aparato || 'N/A'}\n` +
      `• *Marca / Modelo:* ${item.marca || ''} ${item.modelo ? '/ ' + item.modelo : ''}\n` +
      `• *No. Serie:* ${item.serie || 'N/A'}\n` +
      `• *Parte / Refacción:* *${item.nombreNumeroParte || 'Sin descripción'}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *DESGLOSE ECONÓMICO*\n` +
      `• Subtotal: ${formatCurrency(item.subtotal)}\n` +
      `• I.V.A. (16%): ${formatCurrency(item.iva)}\n` +
      `• *TOTAL A PAGAR:* *${formatCurrency(item.costoRefaccion)}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ *Aviso de Garantía:* ${item.notaPolitica || 'En piezas eléctricas no hay devolución, ni garantía.'}\n` +
      (item.detallesOperacion ? `📌 *Detalles de Operación:* ${item.detallesOperacion}\n` : '') +
      `\n_Atendió: ${item.atendio || company.commercialName}_`;
  } else if (module === 'orden_taller') {
    const item = record as OrdenTaller;
    folio = item.numeroOrdenTaller || 'S/F';
    title = `Orden de Taller #${folio}`;
    phone = cleanPhoneNumber(item.celular || item.telefono);

    message = `${header}🔧 *ORDEN DE TALLER & SERVICIO ESPECIALIZADO* • *#${folio}*\n\n` +
      `👤 *Cliente:* ${item.nombreCliente || 'N/A'}\n` +
      `📞 *Teléfono:* ${item.telefono || ''} ${item.celular ? '• ' + item.celular : ''}\n` +
      `📅 *Fecha de Ingreso:* ${item.fechaIngreso || 'N/A'}\n` +
      `📊 *Estatus Actual:* *${item.estatus || 'EN DIAGNÓSTICO'}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚙️ *EQUIPO RECIBIDO EN TALLER*\n` +
      `• *Aparato:* ${item.aparato || 'N/A'}\n` +
      `• *Marca / Modelo:* ${item.marca || ''} ${item.modeloCode ? '/ ' + item.modeloCode : ''}\n` +
      `• *Número de Serie:* ${item.serie || 'N/A'}\n` +
      `• *Falla de Entrada:* ${item.falla || 'N/A'}\n` +
      `• *Accesorios / Estado:* ${item.accesoriosObservaciones || 'Sin accesorios'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛠️ *Técnico Especialista:* ${item.tecnicoAsignado || 'Por asignar'}\n` +
      (item.refacciones ? `🔩 *Refacciones:* ${item.refacciones}\n` : '') +
      `💰 *PRESUPUESTO TOTAL:* *${formatCurrency(item.presupuesto)}*\n` +
      (item.presupuestoDesglose ? `📋 *Detalle:* ${item.presupuestoDesglose}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ *Condiciones:* Servicio técnico especializado fuera de garantía. En piezas eléctricas no hay devolución ni garantía.\n` +
      `\n_Atendió en Recepción: ${item.atendio || company.commercialName}_`;
  } else if (module === 'folio_seguimiento') {
    const item = record as FolioSeguimiento;
    folio = item.folio || 'S/F';
    title = `Folio de Seguimiento #${folio}`;

    message = `${header}📑 *FOLIO DE SEGUIMIENTO & PRESUPUESTO* • *#${folio}*\n\n` +
      `👤 *Cliente:* ${item.cliente || 'N/A'}\n` +
      `📅 *Fecha:* ${item.fecha || 'N/A'}\n` +
      `📊 *Estatus:* *${item.estatus || 'EN PROCESO'}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚙️ *Equipo:* ${item.equipoCategoria || 'N/A'} - ${item.modelo || ''} (Serie: ${item.serie || 'N/A'})\n` +
      `🛠️ *Diagnóstico / Reparación:* ${item.reparacionConsisteEn || 'N/A'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *RESUMEN FINANCIERO*\n` +
      `• Reparación Total: *${formatCurrency(item.reparacionTotal)}*\n` +
      `• Revisión Pagada: ${formatCurrency(item.revisionPagada)}\n` +
      `• Anticipo Requerido (70%): ${formatCurrency(item.anticipoRequerido)}\n` +
      `• *Restan a la Reparación:* *${formatCurrency(item.restanReparacion)}*\n` +
      `\n_Atendió: ${item.atendio || company.commercialName}_`;
  } else if (module === 'hoja_servicio') {
    const item = record as any;
    folio = item.folioLGEMS || item.id || 'S/F';
    title = `Hoja de Servicio #${folio}`;
    phone = cleanPhoneNumber(item.celular || item.telefonoFijo);

    message = `${header}🛠️ *HOJA DE SERVICIO OFICIAL* • *#${folio}*\n\n` +
      `👤 *Cliente:* ${item.nombreCompleto || 'N/A'}\n` +
      `📞 *Contacto:* ${item.telefonoFijo || ''} ${item.celular ? '• ' + item.celular : ''}\n` +
      `📍 *Dirección:* ${item.domicilioCompleto || ''}, ${item.colonia || ''}\n` +
      `⚙️ *Equipo:* ${item.tipoProducto || ''} ${item.modelo ? '/ ' + item.modelo : ''} (Serie: ${item.numeroSerie || 'N/A'})\n` +
      `🛠️ *Diagnóstico:* ${item.observacionesDiagnostico || item.sintomaFallaReportada || 'N/A'}\n` +
      `💰 *Total Liquidación:* *${formatCurrency(item.total)}*\n` +
      `\n_Técnico: ${item.nombreTecnico || item.tecnicoAsignado || 'Especialista'}_`;
  }

  // Si cuenta con evidencias fotográficas adjuntas
  if (record.evidencias && record.evidencias.length > 0) {
    message += `\n📸 *Evidencias fotográficas:* ${record.evidencias.length} foto(s) registradas en el sistema.`;
  }

  return { message, phone, folio, title };
};

// Genera formato para contactos de Agenda
export const formatContactForWhatsApp = (
  contact: AgendaContact,
  company: CompanyInfo
): { message: string; phone: string } => {
  const phone = cleanPhoneNumber(contact.movil || contact.telefono);
  const message = `📇 *CONTACTO - ${company.commercialName.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Nombre:* *${contact.nombre || 'Sin nombre'}*\n` +
    (contact.organizacion ? `🏢 *Empresa / Org:* ${contact.organizacion}\n` : '') +
    (contact.cargo ? `💼 *Puesto / Cargo:* ${contact.cargo}\n` : '') +
    (contact.telefono ? `📞 *Teléfono:* ${contact.telefono} ${contact.extension ? 'Ext: ' + contact.extension : ''}\n` : '') +
    (contact.movil ? `📱 *Celular / Móvil:* ${contact.movil}\n` : '') +
    (contact.correoElectronico ? `✉️ *Email:* ${contact.correoElectronico}\n` : '') +
    (contact.informacionAdicional ? `📝 *Notas:* ${contact.informacionAdicional}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━━\n_Guardado en Agenda de ${company.commercialName}_`;

  return { message, phone };
};

// Abre WhatsApp Web o App con el mensaje
export const openWhatsApp = (message: string, targetPhone?: string) => {
  const encodedText = encodeURIComponent(message);
  let url = '';
  if (targetPhone && targetPhone.length >= 7) {
    url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedText}`;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Comparte un registro como texto formateado a WhatsApp
export const shareRecordToWhatsApp = (
  module: ModuleType,
  record: AnyRecord,
  company: CompanyInfo
) => {
  const { message, phone } = formatRecordForWhatsApp(module, record, company);
  openWhatsApp(message, phone);
};

// Comparte un contacto de la Agenda a WhatsApp
export const shareContactToWhatsApp = (
  contact: AgendaContact,
  company: CompanyInfo
) => {
  const { message, phone } = formatContactForWhatsApp(contact, company);
  openWhatsApp(message, phone);
};

// Genera el PDF del registro y lo comparte como ARCHIVO real a WhatsApp (o descarga con mensaje de apoyo)
export const sharePdfToWhatsApp = async (
  module: ModuleType,
  record: AnyRecord,
  company: CompanyInfo
): Promise<boolean> => {
  try {
    let pdfDoc: any = null;
    let fileName = `Documento_${Date.now()}.pdf`;
    const { message, phone, folio, title } = formatRecordForWhatsApp(module, record, company);

    if (module === 'reporte_sitio') {
      pdfDoc = ExportService.generateReporteSitioPdf(record as ReporteSitio, company);
      fileName = `Reporte_Servicio_${folio || 'Sitio'}.pdf`;
    } else if (module === 'cotizacion') {
      pdfDoc = ExportService.generateCotizacionPdf(record as Cotizacion, company);
      fileName = `Cotizacion_${folio || 'Refacciones'}.pdf`;
    } else if (module === 'orden_taller') {
      pdfDoc = ExportService.generateOrdenTallerPdf(record as OrdenTaller, company);
      fileName = `Orden_Taller_${folio || 'Servicio'}.pdf`;
    } else if (module === 'folio_seguimiento') {
      pdfDoc = ExportService.generateFolioSeguimientoPdf(record as FolioSeguimiento, company);
      fileName = `Folio_Seguimiento_${folio || 'Presupuesto'}.pdf`;
    } else if (module === 'hoja_servicio') {
      pdfDoc = ExportService.generateHojaServicioPdf(record as any, company);
      fileName = `Hoja_Servicio_${folio || 'Oficial'}.pdf`;
    } else if (module === 'agenda') {
      const agendaRecord = record as AgendaContact;
      pdfDoc = ExportService.generateAgendaPdf(agendaRecord, company);
      fileName = `Agenda_Contacto_${agendaRecord.agendaId || 'Directorio'}.pdf`;
    }

    if (!pdfDoc) {
      openWhatsApp(message, phone);
      return false;
    }

    const pdfBlob = pdfDoc.output('blob');
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Intenta Web Share API nativo (soporta compartir archivos en Chrome Android, iOS Safari, etc.)
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: title || `${company.commercialName} - ${fileName}`,
          text: `📄 Adjunto el archivo PDF oficial (${fileName}) de ${company.commercialName}.`,
        });
        return true;
      } catch (shareErr: any) {
        if (shareErr.name !== 'AbortError') {
          console.warn('Native file share failed, falling back to download and link:', shareErr);
        } else {
          return false;
        }
      }
    }

    // Fallback: Descargar el archivo PDF en el dispositivo y abrir WhatsApp con la ficha resumen
    pdfDoc.save(fileName);
    const downloadNotice = `${message}\n\n📎 *NOTA:* _Se ha descargado el archivo PDF oficial (*${fileName}*). Puedes adjuntarlo directamente a esta conversación._`;
    openWhatsApp(downloadNotice, phone);
    return true;
  } catch (err) {
    console.error('Error in sharePdfToWhatsApp:', err);
    // Último recurso: compartir solo el texto estructurado
    shareRecordToWhatsApp(module, record, company);
    return false;
  }
};
