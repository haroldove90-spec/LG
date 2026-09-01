import React from 'react';
import { X, Printer, FileDown, FileSpreadsheet } from 'lucide-react';
import { ModuleType, AnyRecord, CompanyInfo, FolioSeguimiento, Cotizacion, OrdenTaller, ReporteSitio, HojaServicio } from '../types';
import { ExportService } from '../lib/exportUtils';
import { printUnifiedDocumentDirectly } from '../lib/printUtils';
import { StatusBadge } from './StatusBadge';

interface FormatPrintPreviewProps {
  module: ModuleType;
  record: AnyRecord;
  company: CompanyInfo;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const FormatPrintPreview: React.FC<FormatPrintPreviewProps> = ({
  module,
  record,
  company,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    printUnifiedDocumentDirectly(module, record, company);
  };

  const handleExportPdf = () => {
    ExportService.exportToPdf(module, record);
  };

  const handleExportExcel = () => {
    ExportService.exportRecordToExcel(module, record);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-wider">
              Vista Previa de Formato Oficial
            </span>
            <span className="text-sm font-medium text-slate-300">
              {module === 'folio_seguimiento' && (record as FolioSeguimiento).folio}
              {module === 'cotizacion' && (record as Cotizacion).numeroCotizacion}
              {module === 'orden_taller' && (record as OrdenTaller).numeroOrdenTaller}
              {module === 'reporte_sitio' && (record as ReporteSitio).numeroReporte}
              {module === 'hoja_servicio' && (record as HojaServicio).folioLGEMS}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-sm"
              title="Descargar archivo PDF oficial"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
              title="Descargar archivo Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Descargar Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable container) */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-sm border border-slate-200 text-slate-800 text-sm font-sans print:shadow-none print:border-none print:p-0">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  {company.commercialName}
                </h1>
                <p className="text-xs text-slate-500">{company.name} • RFC: {company.rfc}</p>
                <p className="text-xs text-slate-500">{company.address} • Tel: {company.phone}</p>
                <p className="text-[11px] text-sky-700 font-medium mt-1">{company.authorizedCenter}</p>
              </div>

              <div className="text-right sm:self-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  {module === 'folio_seguimiento' && 'FOLIO DE SEGUIMIENTO'}
                  {module === 'cotizacion' && 'NO. DE COTIZACIÓN'}
                  {module === 'orden_taller' && 'ORDEN DE TALLER'}
                  {module === 'reporte_sitio' && 'REPORTE EN SITIO'}
                  {module === 'hoja_servicio' && 'HOJA OFICIAL DE SERVICIO'}
                </span>
                <span className="text-lg font-bold text-slate-900 block font-mono">
                  {module === 'folio_seguimiento' && (record as FolioSeguimiento).folio}
                  {module === 'cotizacion' && (record as Cotizacion).numeroCotizacion}
                  {module === 'orden_taller' && (record as OrdenTaller).numeroOrdenTaller}
                  {module === 'reporte_sitio' && (record as ReporteSitio).numeroReporte}
                  {module === 'hoja_servicio' && (record as HojaServicio).folioLGEMS}
                </span>
                <div className="mt-1 flex justify-end">
                  {'estatus' in record && <StatusBadge status={(record as any).estatus} />}
                  {'tipoServicio' in record && !('estatus' in record) && (
                    <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {(record as any).tipoServicio}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORMAT 1: FOLIO DE SEGUIMIENTO */}
            {module === 'folio_seguimiento' && (() => {
              const f = record as FolioSeguimiento;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Fecha:</span>
                      <span className="font-semibold text-slate-800">{f.fecha || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Atendió:</span>
                      <span className="font-semibold text-slate-800">{f.atendio || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">No. de Orden:</span>
                      <span className="font-semibold text-slate-800">{f.numeroOrden || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Cliente:</span>
                      <span className="font-semibold text-slate-800">{f.cliente || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Información del Equipo</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-slate-400">Categoría:</span> <span className="font-medium text-slate-800">{f.equipoCategoria}</span></div>
                      <div><span className="text-slate-400">Modelo:</span> <span className="font-medium text-slate-800">{f.modelo}</span></div>
                      <div><span className="text-slate-400">Serie:</span> <span className="font-mono text-slate-800">{f.serie}</span></div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Diagnóstico y Trabajos</h3>
                    <p className="text-xs text-slate-700 mb-2">
                      <span className="font-semibold text-slate-800">La reparación consiste en remplazar:</span> {f.reparacionConsisteEn || 'N/A'}
                    </p>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs whitespace-pre-line text-slate-600 font-mono">
                      {f.costosReparacionDesglose || 'Sin desglose especificado'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs">
                    <div>
                      <span className="text-blue-600 font-medium block">Reparación Total:</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(f.reparacionTotal)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium block">Revisión Pagada:</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(f.revisionPagada)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium block">Anticipo (70%):</span>
                      <span className="text-sm font-bold text-blue-700">{formatCurrency(f.anticipoRequerido)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium block">Restan a Reparación:</span>
                      <span className="text-sm font-bold text-emerald-700">{formatCurrency(f.restanReparacion)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between">
                    <span><strong>Vigencia de Presupuesto:</strong> {f.vigenciaPresupuesto}</span>
                    <span><strong>No. de Parte:</strong> {f.numeroParte || 'N/A'}</span>
                  </div>

                  {f.observaciones && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                      <strong>Observaciones:</strong> {f.observaciones}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* FORMAT 2: COTIZACIÓN */}
            {module === 'cotizacion' && (() => {
              const c = record as Cotizacion;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Fecha Pedido:</span>
                      <span className="font-semibold text-slate-800">{c.fechaPedido || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Referencia REF:</span>
                      <span className="font-semibold text-slate-800">{c.referenciaRef || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Atendió:</span>
                      <span className="font-semibold text-slate-800">{c.atendio || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Estatus:</span>
                      <span className="font-semibold text-slate-800">{c.estatus || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Datos del Cliente y Aparato</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Cliente:</span>
                        <span className="font-medium text-slate-900">{c.nombreCliente}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Teléfonos:</span>
                        <span className="font-medium text-slate-800">{c.telefono || ''} {c.celular ? `/ ${c.celular}` : ''}</span>
                      </div>
                      {c.email && (
                        <div>
                          <span className="text-slate-400 block font-medium">Email:</span>
                          <span className="font-medium text-slate-800 truncate block">{c.email}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block font-medium">Aparato:</span>
                        <span className="font-medium text-slate-800">{c.aparato}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Marca:</span>
                        <span className="font-medium text-slate-800">{c.marca}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Modelo (*):</span>
                        <span className="font-medium text-slate-800">{c.modelo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Serie:</span>
                        <span className="font-mono text-slate-800">{c.serie || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre o Número de Parte Solicitada</h3>
                    <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {c.nombreNumeroParte || 'Sin descripción de pieza detallada'}
                    </p>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-200/70 rounded-lg p-3 text-xs text-rose-800">
                    <strong className="font-bold mr-1">AVISO DE POLÍTICA Y GARANTÍA:</strong>
                    <span>{c.notaPolitica || 'En piezas eléctricas no hay devolución, ni garantía'}</span>
                  </div>

                  {(c.detallesOperacion || c.datosPedido) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {c.detallesOperacion && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <strong className="text-slate-700 block mb-1">Detalles de la Operación:</strong>
                          <p className="text-slate-600 whitespace-pre-wrap">{c.detallesOperacion}</p>
                        </div>
                      )}
                      {c.datosPedido && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <strong className="text-slate-700 block mb-1">Datos del Pedido y Entrega:</strong>
                          <p className="text-slate-600 whitespace-pre-wrap">{c.datosPedido}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumen de Importes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Subtotal:</span>
                      <span className="text-sm font-semibold text-slate-800">{formatCurrency(c.subtotal)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">I.V.A. (16%):</span>
                      <span className="text-sm font-semibold text-slate-800">{formatCurrency(c.iva)}</span>
                    </div>
                    <div>
                      <span className="text-sky-700 block font-bold">TOTAL COTIZADO:</span>
                      <span className="text-base font-bold text-sky-800 font-mono">{formatCurrency(c.costoRefaccion)}</span>
                    </div>
                  </div>

                  {/* Firmas de Conformidad */}
                  <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs">
                    <div>
                      <div className="border-b border-slate-300 h-10 mb-1"></div>
                      <span className="font-bold text-slate-800 block text-[11px]">{c.nombreCliente}</span>
                      <span className="text-[10px] text-slate-400">Firma de Conformidad Cliente</span>
                    </div>
                    <div>
                      <div className="border-b border-slate-300 h-10 mb-1"></div>
                      <span className="font-bold text-slate-800 block text-[11px]">{c.atendio || 'Asesor de Servicio'}</span>
                      <span className="text-[10px] text-slate-400">Cotizó / Asesor Técnico</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FORMAT 3: ORDEN TALLER (SIN GARANTÍA) */}
            {module === 'orden_taller' && (() => {
              const o = record as OrdenTaller;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Fecha de Ingreso:</span>
                      <span className="font-semibold text-slate-800">{o.fechaIngreso || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Atendió / Recibió:</span>
                      <span className="font-semibold text-slate-800">{o.atendio || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Técnico Asignado:</span>
                      <span className="font-semibold text-blue-700">{o.tecnicoAsignado || 'Por asignar'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium"># de Pedido:</span>
                      <span className="font-semibold text-slate-800">{o.numeroPedido || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="border border-slate-200 rounded-lg p-3 space-y-1">
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center justify-between">
                        <span>Datos del Cliente</span>
                      </h4>
                      <p className="text-slate-900 font-bold text-sm">{o.nombreCliente}</p>
                      <p className="text-slate-600">
                        <strong>Dirección:</strong> {o.direccion || 'N/A'}
                      </p>
                      <p className="text-slate-600">
                        <strong>Colonia:</strong> {o.colonia || 'N/A'}
                      </p>
                      <p className="text-slate-600">
                        <strong>Teléfonos:</strong> {o.telefono || ''} {o.celular ? `/ Cel: ${o.celular}` : ''}
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-3 space-y-1">
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center justify-between">
                        <span>Datos del Aparato</span>
                      </h4>
                      <p className="text-slate-900 font-bold text-sm">{o.aparato} • {o.marca}</p>
                      <p className="text-slate-600">
                        <strong>Modelo Code / Versión:</strong> {o.modeloCode || 'N/A'}
                      </p>
                      <p className="text-slate-600 font-mono">
                        <strong>Número de Serie:</strong> {o.serie || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-3">
                    <div>
                      <strong className="text-slate-700 block uppercase tracking-wider text-[11px] mb-1">
                        Falla Reportada en Recepción:
                      </strong>
                      <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap font-medium">
                        {o.falla || 'Sin reporte de falla registrado'}
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-700 block uppercase tracking-wider text-[11px] mb-1">
                        Accesorios / Observaciones de Entrada:
                      </strong>
                      <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap">
                        {o.accesoriosObservaciones || 'Se recibe sin accesorios adicionales'}
                      </p>
                    </div>
                  </div>

                  {/* Presupuesto y Refacciones */}
                  <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-3">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Presupuesto y Refacciones
                    </h4>

                    {o.presupuestoDesglose && (
                      <div>
                        <strong className="text-slate-600 block mb-1">Detalle de Presupuesto / Mano de Obra:</strong>
                        <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px] whitespace-pre-wrap">
                          {o.presupuestoDesglose}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <strong className="text-slate-600 block mb-1">Refacciones Requeridas:</strong>
                        <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                          {o.refacciones || 'Sin refacciones especificadas'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-center text-right">
                        <span className="text-slate-500 text-[11px] block font-medium">TOTAL PRESUPUESTO</span>
                        <span className="text-lg font-black text-blue-700 font-mono">
                          {formatCurrency(o.presupuesto)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Aviso de Política de Taller */}
                  <div className="bg-rose-50/70 border border-rose-200/70 rounded-lg p-3 text-xs text-rose-800">
                    <strong className="font-bold mr-1">AVISO DE POLÍTICA Y GARANTÍA:</strong>
                    <span>En piezas eléctricas no hay devolución, ni garantía. Servicio técnico especializado fuera de garantía de fabricante.</span>
                  </div>

                  {/* Info Confidencial */}
                  {o.informacionConfidencial && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                      <strong className="block font-bold mb-0.5">Información Confidencial / Notas Internas:</strong>
                      <p className="whitespace-pre-wrap">{o.informacionConfidencial}</p>
                    </div>
                  )}

                  {/* Firmas de Conformidad */}
                  <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs">
                    <div>
                      <div className="border-b border-slate-300 h-10 mb-1"></div>
                      <span className="font-bold text-slate-800 block text-[11px]">{o.nombreCliente}</span>
                      <span className="text-[10px] text-slate-400">Firma de Entrega / Conformidad Cliente</span>
                    </div>
                    <div>
                      <div className="border-b border-slate-300 h-10 mb-1"></div>
                      <span className="font-bold text-slate-800 block text-[11px]">{o.tecnicoAsignado || o.atendio || 'Técnico Especializado'}</span>
                      <span className="text-[10px] text-slate-400">Técnico / Responsable de Taller</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FORMAT 4: REPORTE EN SITIO */}
            {module === 'reporte_sitio' && (() => {
              const r = record as ReporteSitio;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div><span className="text-slate-400 block">Fecha Reporte:</span><span className="font-semibold">{r.fechaReporte}</span></div>
                    <div><span className="text-slate-400 block">Tipo Servicio:</span><span className="font-semibold text-purple-700">{r.tipoServicio}</span></div>
                    <div><span className="text-slate-400 block">Técnico en Sitio:</span><span className="font-semibold">{r.tecnico}</span></div>
                    <div><span className="text-slate-400 block">Cita Visita:</span><span className="font-semibold">{r.fechaVisita} {r.horaVisita}</span></div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 text-xs">
                    <h4 className="font-bold text-slate-700 mb-1">Ubicación y Domicilio</h4>
                    <p className="text-slate-800 font-medium">{r.nombreCliente} ({r.tipoCasa})</p>
                    <p className="text-slate-600">{r.direccion}, Col. {r.colonia}</p>
                    <p className="text-slate-500">Tel: {r.telefono} {r.celular ? `/ Cel: ${r.celular}` : ''}</p>
                    <p className="text-slate-500 mt-1">
                      <strong>Equipo:</strong> {r.aparato} {r.marca} {r.modelo} | <strong>Serie Equipo:</strong> {r.serieEquipo} | <strong>Serie Difusor:</strong> {r.serieDifusor || 'N/A'}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 text-xs">
                    <strong className="text-slate-700 block mb-1">Falla Reportada:</strong>
                    <p className="text-slate-600 mb-2">{r.fallaReportada}</p>
                    <strong className="text-slate-700 block mb-1">Bitácora de Visitas en Domicilio:</strong>
                    <div className="space-y-1.5 mt-1 bg-slate-50 p-2 rounded">
                      <p><span className="font-semibold text-slate-700">1ª Visita:</span> {r.detalles1erVisita || 'Sin registro'}</p>
                      {r.detalles2daVisita && <p><span className="font-semibold text-slate-700">2ª Visita:</span> {r.detalles2daVisita}</p>}
                      {r.detalles3eraVisita && <p><span className="font-semibold text-slate-700">3ª Visita:</span> {r.detalles3eraVisita}</p>}
                    </div>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-purple-900 block">Partes Solicitadas: {r.partesSolicitadas || 'N/A'}</span>
                      <span className="text-slate-500">Orden de Servicio: {r.numeroOrdenServicio || 'N/A'} • Pedido: {r.numeroPedido || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Presupuesto</span>
                      <span className="text-base font-bold text-purple-800">
                        {typeof r.presupuesto === 'number'
                          ? formatCurrency(r.presupuesto)
                          : r.presupuesto || '$0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FORMAT 5: HOJA DE SERVICIO OFICIAL */}
            {module === 'hoja_servicio' && (() => {
              const h = record as HojaServicio;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <div><span className="text-slate-400 block">Recepción:</span><span className="font-semibold">{h.fechaRecepcion}</span></div>
                    <div><span className="text-slate-400 block">Requerida:</span><span className="font-semibold">{h.fechaRequerida}</span></div>
                    <div><span className="text-slate-400 block">Inicio At.:</span><span className="font-semibold">{h.fechaInicioAtencion}</span></div>
                    <div><span className="text-slate-400 block">Fin At.:</span><span className="font-semibold">{h.fechaFinAtencion}</span></div>
                    <div><span className="text-slate-400 block">Entrega:</span><span className="font-semibold">{h.fechaEntrega}</span></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="border border-slate-200 rounded-lg p-2.5">
                      <h4 className="font-bold text-slate-700 mb-1">Cliente & Domicilio</h4>
                      <p className="font-medium text-slate-900">{h.nombreCompleto}</p>
                      <p className="text-slate-500">{h.domicilioCompleto}, {h.colonia}, {h.ciudad}, {h.estado} CP {h.codigoPostal}</p>
                      <p className="text-slate-500">Tel: {h.telefonoFijo} / Cel: {h.celular}</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-2.5">
                      <h4 className="font-bold text-slate-700 mb-1">Producto & Garantía</h4>
                      <p className="font-medium text-slate-900">{h.tipoProducto} • {h.modelo}</p>
                      <p className="text-slate-500">Serie: <span className="font-mono">{h.numeroSerie}</span></p>
                      <p className="text-slate-500">Distribuidor: {h.distribuidor} ({h.fechaCompra})</p>
                      <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Garantía: {h.garantia} ({h.validacionGarantia})</p>
                    </div>
                  </div>

                  {/* Parámetros técnicos */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div><span className="text-slate-400 block">Tierra Física:</span><span className="font-semibold">{h.hayTierraFisica}</span></div>
                    <div><span className="text-slate-400 block">Voltaje (V):</span><span className="font-semibold">{h.voltajeDomicilio}</span></div>
                    <div><span className="text-slate-400 block">Presión Agua:</span><span className="font-semibold">{h.presionAguaPSI}</span></div>
                    <div><span className="text-slate-400 block">Presión Gas:</span><span className="font-semibold">{h.presionGas}</span></div>
                  </div>

                  {/* Diagnóstico */}
                  <div className="border border-slate-200 rounded-lg p-2.5 text-xs">
                    <strong className="text-slate-700 block mb-0.5">Falla Reportada:</strong>
                    <p className="text-slate-600 mb-1.5">{h.sintomaFallaReportada}</p>
                    <strong className="text-slate-700 block mb-0.5">Diagnóstico y Solución Técnica:</strong>
                    <p className="text-slate-600">{h.observacionesDiagnostico}</p>
                  </div>

                  {/* Tabla de Refacciones */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 border-b border-slate-200">
                      Refacciones Utilizadas
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-2">No. Parte</th>
                          <th className="p-2">Descripción</th>
                          <th className="p-2 text-center">Cant</th>
                          <th className="p-2 text-right">Precio</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {h.refacciones && h.refacciones.length > 0 ? (
                          h.refacciones.map((r, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-mono">{r.numeroParte}</td>
                              <td className="p-2">{r.descripcion}</td>
                              <td className="p-2 text-center">{r.cantidad}</td>
                              <td className="p-2 text-right">{formatCurrency(r.monto)}</td>
                              <td className="p-2 text-right font-medium">{formatCurrency(r.cantidad * r.monto)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-2 text-center text-slate-400">Sin refacciones utilizadas</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Desglose Financiero */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div><span className="text-slate-500">Mano de Obra:</span> <span className="font-semibold">{formatCurrency(h.manoDeObra)}</span></div>
                    <div><span className="text-slate-500">Transporte/Visita:</span> <span className="font-semibold">{formatCurrency((h.transporte || 0) + (h.visita || 0))}</span></div>
                    <div><span className="text-slate-500">Repuestos:</span> <span className="font-semibold">{formatCurrency(h.repuestosMonto)}</span></div>
                    <div><span className="text-slate-500">IVA ({h.ivaPorcentaje}%):</span> <span className="font-semibold">{formatCurrency(h.ivaMonto)}</span></div>
                    <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-slate-600 font-bold">TOTAL LIQUIDACIÓN:</span>
                      <span className="text-base font-bold text-rose-700">{formatCurrency(h.total)}</span>
                    </div>
                  </div>

                  {/* Digital Signature rendering */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-center text-xs">
                    <div className="flex flex-col items-center">
                      {h.firmaClienteDataUrl ? (
                        <img src={h.firmaClienteDataUrl} alt="Firma Cliente" className="h-12 object-contain mb-1" />
                      ) : (
                        <div className="h-12 border-b border-slate-300 w-3/4 mb-1 flex items-end justify-center text-[10px] text-slate-300">Firma Pendiente</div>
                      )}
                      <span className="font-bold text-slate-800">{h.nombreClienteFirma || h.nombreCompleto}</span>
                      <span className="text-[10px] text-slate-400">Firma del Cliente de Conformidad</span>
                    </div>

                    <div className="flex flex-col items-center">
                      {h.firmaTecnicoDataUrl ? (
                        <img src={h.firmaTecnicoDataUrl} alt="Firma Técnico" className="h-12 object-contain mb-1" />
                      ) : (
                        <div className="h-12 border-b border-slate-300 w-3/4 mb-1 flex items-end justify-center text-[10px] text-slate-300">Firma Pendiente</div>
                      )}
                      <span className="font-bold text-slate-800">{h.nombreTecnico || h.tecnicoAsignado}</span>
                      <span className="text-[10px] text-slate-400">Firma del Técnico Especialista</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* General Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              Documento expedido por {company.name}. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
