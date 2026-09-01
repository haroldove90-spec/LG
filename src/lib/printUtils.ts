import { CompanyInfo, Cotizacion, OrdenTaller, ReporteSitio, FolioSeguimiento, HojaServicio, ModuleType, AnyRecord } from '../types';

const formatCurrency = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '$0.00 MXN';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '$0.00 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
};

// Generador unificado de HTML minimalista, formal y de alto contraste idéntico al Formato de Citas (Image 5)
export const generateMinimalistDocumentHtml = (
  module: ModuleType,
  record: AnyRecord,
  company: CompanyInfo
): { html: string; title: string; folio: string } => {
  let docTitle = 'DOCUMENTO OFICIAL';
  let folioText = 'FOLIO';
  let badgeLabel = 'FOLIO';
  let bodyContent = '';

  if (module === 'reporte_sitio') {
    const item = record as ReporteSitio;
    docTitle = 'REPORTE TÉCNICO DE CITA Y SERVICIO EN SITIO';
    badgeLabel = 'REPORTE';
    folioText = item.numeroReporte || 'S/F';

    bodyContent = `
      <div class="section-title">1. Identidad del Reporte & Datos del Cliente</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Tipo de Servicio</div>
          <div class="field-value">${item.tipoServicio || 'CON CARGO'}</div>
        </div>
        <div class="box">
          <div class="field-label">Fecha de Reporte</div>
          <div class="field-value">${item.fechaReporte || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">Personal de Atención</div>
          <div class="field-value">${item.atendio || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">Tipo de Inmueble</div>
          <div class="field-value">${item.tipoCasa || '-'}</div>
        </div>
      </div>

      <div class="box box-gray">
        <div class="field-label">Nombre del Cliente / Solicitante</div>
        <div class="field-value" style="font-size: 13px;">${item.nombreCliente || 'Sin nombre'}</div>
      </div>

      <div class="section-title">2. Ubicación & Domicilio de Atención</div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Dirección, Número y Entre Calles</div>
          <div class="field-value">${item.direccion || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Colonia</div>
          <div class="field-value">${item.colonia || 'N/A'}</div>
        </div>
      </div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Teléfono Fijo</div>
          <div class="field-value">${item.telefono || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Móvil / Celular</div>
          <div class="field-value">${item.celular || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">3. Información del Equipo & Falla Reportada</div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Aparato</div>
          <div class="field-value">${item.aparato || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Marca</div>
          <div class="field-value">${item.marca || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Modelo</div>
          <div class="field-value">${item.modelo || 'N/A'}</div>
        </div>
      </div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Serie del Difusor</div>
          <div class="field-value font-mono">${item.serieDifusor || 'N/A - Unidad Compacta'}</div>
        </div>
        <div class="box">
          <div class="field-label">Serie del Equipo</div>
          <div class="field-value font-mono">${item.serieEquipo || 'N/A'}</div>
        </div>
      </div>
      <div class="box">
        <div class="field-label">Falla Reportada por el Cliente</div>
        <div class="field-value" style="font-weight: 500; font-size: 11px;">${item.fallaReportada || 'Sin reporte detallado'}</div>
      </div>

      <div class="section-title">4. Programación de Visita & Asignación Técnica</div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Fecha Programada</div>
          <div class="field-value">${item.fechaVisita || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Horario de Visita</div>
          <div class="field-value">${item.horaVisita || 'TRANSCURSO DEL DIA'}</div>
        </div>
        <div class="box">
          <div class="field-label">Técnico Asignado</div>
          <div class="field-value">${item.tecnico || 'Sin asignar'}</div>
        </div>
      </div>

      <div class="section-title">5. Bitácora de Visitas Técnicas en Domicilio</div>
      <div class="box">
        <div class="field-label">Detalles de 1ª Visita</div>
        <div class="field-value" style="font-weight: 500; font-size: 10.5px;">${item.detalles1erVisita || 'Sin registro de primera visita'}</div>
      </div>
      ${
        item.detalles2daVisita || item.detalles3eraVisita
          ? `
        <div class="grid-2">
          ${
            item.detalles2daVisita
              ? `
            <div class="box">
              <div class="field-label">Detalles de 2ª Visita</div>
              <div class="field-value" style="font-weight: 500; font-size: 10.5px;">${item.detalles2daVisita}</div>
            </div>
          `
              : ''
          }
          ${
            item.detalles3eraVisita
              ? `
            <div class="box">
              <div class="field-label">Detalles de 3ª Visita</div>
              <div class="field-value" style="font-weight: 500; font-size: 10.5px;">${item.detalles3eraVisita}</div>
            </div>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      <div class="section-title">6. Presupuesto, Refacciones & Requisición</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Presupuesto Total</div>
          <div class="field-value" style="color: #0369a1;">${formatCurrency(item.presupuesto)}</div>
        </div>
        <div class="box">
          <div class="field-label"># de Pedido</div>
          <div class="field-value">${item.numeroPedido || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Orden de Servicio</div>
          <div class="field-value">${item.numeroOrdenServicio || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Partes Solicitadas</div>
          <div class="field-value">${item.partesSolicitadas || 'N/A'}</div>
        </div>
      </div>

      ${
        item.observaciones
          ? `
        <div class="box box-gray">
          <div class="field-label">Observaciones Generales</div>
          <div class="field-value" style="font-weight: 500; font-size: 10px;">${item.observaciones}</div>
        </div>
      `
          : ''
      }

      <div class="signatures">
        <div>
          <div class="sign-line">Firma / Aceptación del Cliente<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.nombreCliente || 'Cliente'}</span></div>
        </div>
        <div>
          <div class="sign-line">Firma Técnico / Asesor de Servicio<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.tecnico || item.atendio || 'Centro de Servicio'}</span></div>
        </div>
      </div>
    `;
  } else if (module === 'cotizacion') {
    const item = record as Cotizacion;
    docTitle = 'COTIZACIÓN DE REFACCIONES & PEDIDOS';
    badgeLabel = 'COTIZACIÓN';
    folioText = item.numeroCotizacion || 'S/F';

    bodyContent = `
      <div class="section-title">1. Control & Estatus de la Cotización</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Estatus / Pago</div>
          <div class="field-value">${item.estatus || 'COTIZADO'}</div>
        </div>
        <div class="box">
          <div class="field-label">Fecha de Pedido</div>
          <div class="field-value">${item.fechaPedido || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">Atendió / Asesor</div>
          <div class="field-value">${item.atendio || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">Referencia REF</div>
          <div class="field-value font-mono">${item.referenciaRef || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">2. Datos del Cliente & Contacto</div>
      <div class="box box-gray">
        <div class="field-label">Nombre del Cliente / Solicitante</div>
        <div class="field-value" style="font-size: 13px;">${item.nombreCliente || 'Sin nombre'}</div>
      </div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Teléfono Fijo</div>
          <div class="field-value">${item.telefono || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Móvil / Celular</div>
          <div class="field-value">${item.celular || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Correo Electrónico</div>
          <div class="field-value">${item.email || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">3. Información del Equipo & Refacción Solicitada</div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Aparato</div>
          <div class="field-value">${item.aparato || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Marca</div>
          <div class="field-value">${item.marca || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Modelo (Requerido)</div>
          <div class="field-value">${item.modelo || 'N/A'}</div>
        </div>
      </div>
      <div class="box">
        <div class="field-label">Número de Serie del Equipo</div>
        <div class="field-value font-mono">${item.serie || 'N/A'}</div>
      </div>

      <div class="box">
        <div class="field-label">Descripción / Nombre / Número de Parte Solicitada</div>
        <div class="field-value" style="font-size: 11.5px; font-weight: 700; color: #0369a1;">
          ${item.nombreNumeroParte || 'Sin descripción de pieza'}
        </div>
      </div>

      <div class="section-title">4. Desglose Económico & Presupuesto</div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Subtotal Refacción</div>
          <div class="field-value">${formatCurrency(item.subtotal)}</div>
        </div>
        <div class="box">
          <div class="field-label">I.V.A. (16%)</div>
          <div class="field-value">${formatCurrency(item.iva)}</div>
        </div>
        <div class="box" style="background-color: #f0fdf4; border-color: #86efac;">
          <div class="field-label" style="color: #166534;">Total Cotización</div>
          <div class="field-value" style="font-size: 14px; font-weight: 800; color: #15803d;">
            ${formatCurrency(item.costoRefaccion)}
          </div>
        </div>
      </div>

      <div class="policy-box">
        <strong>AVISO DE POLÍTICA Y GARANTÍA:</strong> ${item.notaPolitica || 'En piezas eléctricas no hay devolución, ni garantía.'}
      </div>

      ${
        item.detallesOperacion || item.datosPedido
          ? `
        <div class="section-title">5. Seguimiento de Pedido & Operación</div>
        <div class="grid-2">
          <div class="box">
            <div class="field-label">Detalles de Operación y Pagos</div>
            <div class="field-value" style="font-weight: 500; font-size: 10px;">${item.detallesOperacion || 'Sin observaciones'}</div>
          </div>
          <div class="box">
            <div class="field-label">Datos del Pedido y Entrega</div>
            <div class="field-value" style="font-weight: 500; font-size: 10px;">${item.datosPedido || 'Sin observaciones'}</div>
          </div>
        </div>
      `
          : ''
      }

      <div class="signatures">
        <div>
          <div class="sign-line">Firma de Autorización del Cliente<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.nombreCliente || 'Cliente'}</span></div>
        </div>
        <div>
          <div class="sign-line">Cotizó / Asesor de Refacciones<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.atendio || 'Asesor de Servicio'}</span></div>
        </div>
      </div>
    `;
  } else if (module === 'orden_taller') {
    const item = record as OrdenTaller;
    docTitle = 'ORDEN DE TALLER (RECEPCIÓN & SERVICIO)';
    badgeLabel = 'ORDEN DE TALLER';
    folioText = item.numeroOrdenTaller || 'S/F';

    bodyContent = `
      <div class="section-title">1. Control & Folio de Taller</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Status de la Orden</div>
          <div class="field-value">${item.estatus || 'EN DIAGNOSTICO'}</div>
        </div>
        <div class="box">
          <div class="field-label">Fecha de Ingreso</div>
          <div class="field-value">${item.fechaIngreso || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">Atendió / Receptor</div>
          <div class="field-value">${item.atendio || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label"># de Pedido / Ref.</div>
          <div class="field-value font-mono">${item.numeroPedido || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">2. Datos del Cliente & Ubicación</div>
      <div class="box box-gray">
        <div class="field-label">Nombre del Cliente / Propietario</div>
        <div class="field-value" style="font-size: 13px;">${item.nombreCliente || 'Sin nombre'}</div>
      </div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Dirección, Número y Calle</div>
          <div class="field-value">${item.direccion || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Colonia</div>
          <div class="field-value">${item.colonia || 'N/A'}</div>
        </div>
      </div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Teléfono Fijo</div>
          <div class="field-value">${item.telefono || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Móvil / Celular</div>
          <div class="field-value">${item.celular || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">3. Información del Equipo & Falla de Entrada</div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Aparato</div>
          <div class="field-value">${item.aparato || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Marca</div>
          <div class="field-value">${item.marca || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Modelo Code / Versión</div>
          <div class="field-value">${item.modeloCode || 'N/A'}</div>
        </div>
      </div>
      <div class="box">
        <div class="field-label">Número de Serie del Equipo</div>
        <div class="field-value font-mono">${item.serie || 'N/A'}</div>
      </div>
      <div class="box">
        <div class="field-label">Falla Reportada en Recepción por el Cliente</div>
        <div class="field-value" style="font-weight: 500; font-size: 11px;">${item.falla || 'Sin reporte de falla'}</div>
      </div>
      <div class="box box-gray">
        <div class="field-label">Accesorios Recibidos / Estado Físico de Entrada</div>
        <div class="field-value" style="font-weight: 500; font-size: 10.5px;">${item.accesoriosObservaciones || 'Sin accesorios adicionales'}</div>
      </div>

      <div class="section-title">4. Diagnóstico Técnico & Asignación</div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Técnico Especialista Asignado</div>
          <div class="field-value" style="color: #0369a1;">${item.tecnicoAsignado || 'Por asignar'}</div>
        </div>
        <div class="box">
          <div class="field-label">Refacciones Requeridas</div>
          <div class="field-value">${item.refacciones || 'Sin refacciones especificadas'}</div>
        </div>
      </div>

      <div class="section-title">5. Presupuesto Desglosado & Total</div>
      ${
        item.presupuestoDesglose
          ? `
        <div class="box">
          <div class="field-label">Detalle de Costos y Reparación</div>
          <div class="field-value" style="font-weight: 500; font-size: 10.5px; white-space: pre-line;">${item.presupuestoDesglose}</div>
        </div>
      `
          : ''
      }
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Subtotal Mano de Obra / Ref.</div>
          <div class="field-value">${formatCurrency(item.subtotal || item.presupuesto)}</div>
        </div>
        <div class="box">
          <div class="field-label">I.V.A. (16%)</div>
          <div class="field-value">${formatCurrency(item.iva)}</div>
        </div>
        <div class="box" style="background-color: #f0fdf4; border-color: #86efac;">
          <div class="field-label" style="color: #166534;">Total Presupuesto</div>
          <div class="field-value" style="font-size: 14px; font-weight: 800; color: #15803d;">
            ${formatCurrency(item.presupuesto)}
          </div>
        </div>
      </div>

      <div class="policy-box">
        <strong>AVISO DE POLÍTICA Y CONDICIONES:</strong> En piezas eléctricas no hay devolución, ni garantía. Servicio técnico especializado fuera de garantía de fabricante. Equipos no reclamados después de 30 días causarán almacenaje.
      </div>

      <div class="signatures">
        <div>
          <div class="sign-line">Firma de Entrega / Conformidad Cliente<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.nombreCliente || 'Cliente'}</span></div>
        </div>
        <div>
          <div class="sign-line">Firma Técnico / Receptor en Taller<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.tecnicoAsignado || item.atendio || 'Recepción Taller'}</span></div>
        </div>
      </div>
    `;
  } else if (module === 'folio_seguimiento') {
    const item = record as FolioSeguimiento;
    docTitle = 'FOLIO DE SEGUIMIENTO & PRESUPUESTO';
    badgeLabel = 'FOLIO';
    folioText = item.folio || 'S/F';

    bodyContent = `
      <div class="section-title">1. Control & Datos Generales</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Estatus Actual</div>
          <div class="field-value">${item.estatus || 'EN PROCESO'}</div>
        </div>
        <div class="box">
          <div class="field-label">Fecha</div>
          <div class="field-value">${item.fecha || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">Atendió</div>
          <div class="field-value">${item.atendio || '--'}</div>
        </div>
        <div class="box">
          <div class="field-label">No. de Orden</div>
          <div class="field-value font-mono">${item.numeroOrden || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">2. Datos del Cliente & Equipo</div>
      <div class="box box-gray">
        <div class="field-label">Nombre del Cliente</div>
        <div class="field-value" style="font-size: 13px;">${item.cliente || 'Sin nombre'}</div>
      </div>
      <div class="grid-3">
        <div class="box">
          <div class="field-label">Categoría de Equipo</div>
          <div class="field-value">${item.equipoCategoria || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Modelo</div>
          <div class="field-value">${item.modelo || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Número de Serie</div>
          <div class="field-value font-mono">${item.serie || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">3. Diagnóstico Técnico & Reparación</div>
      <div class="box">
        <div class="field-label">La Reparación Consiste en Reemplazar</div>
        <div class="field-value" style="font-size: 11px;">${item.reparacionConsisteEn || 'N/A'}</div>
      </div>
      ${
        item.costosReparacionDesglose
          ? `
        <div class="box box-gray">
          <div class="field-label">Desglose de Costos de Reparación</div>
          <div class="field-value font-mono" style="font-size: 10px; white-space: pre-line;">${item.costosReparacionDesglose}</div>
        </div>
      `
          : ''
      }

      <div class="section-title">4. Resumen Financiero</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Reparación Total</div>
          <div class="field-value" style="font-weight: 800; color: #0369a1;">${formatCurrency(item.reparacionTotal)}</div>
        </div>
        <div class="box">
          <div class="field-label">Revisión Pagada</div>
          <div class="field-value">${formatCurrency(item.revisionPagada)}</div>
        </div>
        <div class="box">
          <div class="field-label">Anticipo Requerido (70%)</div>
          <div class="field-value" style="color: #b45309;">${formatCurrency(item.anticipoRequerido)}</div>
        </div>
        <div class="box" style="background-color: #f0fdf4; border-color: #86efac;">
          <div class="field-label" style="color: #166534;">Restan a Reparación</div>
          <div class="field-value" style="color: #15803d; font-weight: 800;">${formatCurrency(item.restanReparacion)}</div>
        </div>
      </div>

      <div class="signatures">
        <div>
          <div class="sign-line">Firma / Conformidad Cliente<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.cliente || 'Cliente'}</span></div>
        </div>
        <div>
          <div class="sign-line">Firma Técnico / Asesor<br><span style="font-weight: normal; font-size: 8px; color: #64748b;">${item.atendio || 'Asesor Técnico'}</span></div>
        </div>
      </div>
    `;
  }

  const html = `
    <div class="header">
      <div>
        <div class="company-name">${company.commercialName || 'CENTRO DE SERVICIO ESPECIALIZADO'}</div>
        <div class="doc-title">${docTitle}</div>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
          ${company.address || ''} • Tel: ${company.phone || ''} • RFC: ${company.rfc || ''}
        </div>
        <div style="font-size: 9px; color: #0369a1; margin-top: 1px; font-weight: 600;">
          ${company.authorizedCenter || ''}
        </div>
      </div>
      <div style="text-align: right;">
        <div class="badge">${badgeLabel}: #${folioText}</div>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">
          Fecha: ${(record as any).fecha || (record as any).fechaReporte || (record as any).fechaPedido || (record as any).fechaIngreso || new Date().toLocaleDateString('es-MX')}
        </div>
      </div>
    </div>
    ${bodyContent}
    <div class="footer">
      <div>Documento oficial generado por ServiTrack Pro • ${company.commercialName}</div>
      <div>Página 1 / 1</div>
    </div>
  `;

  return { html, title: `${docTitle}_${folioText}`, folio: folioText };
};

// Función para imprimir inmediatamente abriendo el diálogo nativo de la impresora
export const printUnifiedDocumentDirectly = (
  module: ModuleType,
  record: AnyRecord,
  company: CompanyInfo
) => {
  const { html, title } = generateMinimalistDocumentHtml(module, record, company);

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
              @page {
                size: letter portrait;
                margin: 10mm 12mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                color: #0f172a;
                background: #ffffff;
                margin: 0;
                padding: 0;
                font-size: 11px;
                line-height: 1.4;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              * {
                box-sizing: border-box;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 8px;
                margin-bottom: 10px;
              }
              .company-name {
                font-size: 15px;
                font-weight: 800;
                color: #0f172a;
                letter-spacing: -0.5px;
              }
              .doc-title {
                font-size: 10.5px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                margin-top: 2px;
                letter-spacing: 0.5px;
              }
              .badge {
                background: #0f172a;
                color: #ffffff;
                font-family: monospace;
                font-weight: 700;
                font-size: 12.5px;
                padding: 5px 12px;
                border-radius: 4px;
                display: inline-block;
              }
              .section-title {
                font-size: 9.5px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #334155;
                margin-top: 10px;
                margin-bottom: 5px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 3px;
              }
              .box {
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 6px 10px;
                margin-bottom: 6px;
                background-color: #ffffff;
              }
              .box-gray {
                background-color: #f8fafc;
              }
              .field-label {
                font-size: 8.5px;
                font-weight: 700;
                text-transform: uppercase;
                color: #64748b;
                display: block;
                margin-bottom: 1.5px;
              }
              .field-value {
                font-size: 11px;
                font-weight: 700;
                color: #0f172a;
              }
              .font-mono {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              }
              .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
              }
              .grid-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 8px;
              }
              .grid-4 {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
              }
              .policy-box {
                background: #fef2f2;
                border: 1px solid #f87171;
                border-radius: 4px;
                padding: 6px 10px;
                font-size: 9.5px;
                color: #991b1b;
                margin-top: 6px;
                margin-bottom: 6px;
              }
              .signatures {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 18px;
                padding-top: 6px;
              }
              .sign-line {
                border-top: 1px solid #94a3b8;
                text-align: center;
                padding-top: 4px;
                font-size: 9px;
                font-weight: 700;
                color: #475569;
                text-transform: uppercase;
              }
              .footer {
                border-top: 1px solid #cbd5e1;
                padding-top: 6px;
                margin-top: 14px;
                display: flex;
                justify-content: space-between;
                font-size: 9px;
                color: #94a3b8;
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Error invoking print directly:', e);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 250);
    }
  } catch (err) {
    console.error('Fallback print:', err);
    window.print();
  }
};
