import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Save,
  Printer,
  Copy,
  Trash2,
  Edit,
  X,
  Phone,
  Building2,
  MapPin,
  Sparkles,
  LayoutList,
  LayoutGrid,
  Table as TableIcon,
  Smartphone,
  FileSpreadsheet,
  FileDown,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  CalendarCheck,
  Truck,
  Wrench,
  UserCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { ReporteSitio, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 10;

const TIPO_SERVICIO_OPTIONS = [
  'CON CARGO',
  'GARANTIA',
  'PRESUPUESTO',
  'REVISION TECNICA',
  'MANTENIMIENTO',
  'INSTALACION',
];

const ATENDIO_OPTIONS = [
  'ELIZABETH',
  'MARIANA SILVA',
  'CARLOS MENDOZA',
  'JORGE ESTRADA',
  'DAVID RAMÍREZ',
  'ROBERTO VALENZUELA',
  'JOAQUIN',
  'FERNANDO MORALES',
];

const TIPO_CASA_OPTIONS = [
  '-',
  'CASA',
  'CASA DE 1 PISO',
  'CASA DE 2 PISOS',
  'DEPARTAMENTO',
  'LOCAL COMERCIAL',
  'OFICINA',
  'PRIVADA/CONDOMINIO',
];

const APARATO_OPTIONS = [
  'REFRIGERADOR',
  'LAVADORA',
  'SECADORA',
  'CENTRO DE LAVADO',
  'ESTUFA / PARRILLA',
  'HORNO DE MICROONDAS',
  'MINISPLIT / AIRE',
  'LAVA-VAJILLAS',
  'PANTALLA SMART TV',
  'CONGELADOR',
  'ENFRIADOR DE AGUA',
  'CAVA DE VINOS',
];

const MARCA_OPTIONS = [
  'LG',
  'SAMSUNG',
  'WHIRLPOOL',
  'MABE',
  'GENERAL ELECTRIC',
  'MAYTAG',
  'FRIGIDAIRE',
  'DAEWOO / WINIA',
  'PANASONIC',
  'BOSCH',
  'ELECTROLUX',
  'CARRIER',
  'MIRAGE',
  'YORK',
  'HISENSE',
];

const HORA_VISITA_OPTIONS = [
  'TRANSCURSO DEL DIA',
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
  '09:00 AM - 12:00 PM',
  '12:00 PM - 03:00 PM',
  '03:00 PM - 06:00 PM',
  'POR CONFIRMAR',
];

const TECNICO_OPTIONS = [
  'JOAQUIN',
  'ROBERTO VALENZUELA',
  'DAVID RAMÍREZ',
  'CARLOS MENDOZA',
  'FERNANDO MORALES',
  'MIGUEL ÁNGEL TORRES',
  'LUIS EDUARDO GARZA',
];

const OBSERVACIONES_PRESETS = [
  'CLIENTE DEPOSITO $700.00 DE REVISION',
  'CLIENTE DEPOSITO $500.00 DE REVISION',
  'PAGO DE DIAGNOSTICO PENDIENTE AL ARRIBO',
  'GARANTIA AUTORIZADA POR PLANTA / DISTRIBUIDOR',
  'PRESUPUESTO PREVIO ACEPTADO POR EL CLIENTE',
  'REVISION SIN COSTO (SEGUNDA VUELTA)',
];

export const ReporteSitioModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [reportes, setReportes] = useState<ReporteSitio[]>(() => StorageService.getReportesSitio());

  // Vista principal: En primer plano el formulario de captura ('create'), en segundo plano el buscador/directorio ('directory')
  const [mainView, setMainView] = useState<'create' | 'directory'>('create');

  // Búsqueda en directorio
  const [searchQuery, setSearchQuery] = useState('');

  // Modo de visualización en directorio (Horizontal por defecto)
  const [viewMode, setViewMode] = useState<'horizontal' | 'table' | 'grid'>('horizontal');

  // Paginación en directorio
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de edición y eliminación
  const [editingItem, setEditingItem] = useState<ReporteSitio | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ReporteSitio | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado inicial en blanco para nuevo reporte
  const getBlankFormState = (): Partial<ReporteSitio> => {
    const nextNum = StorageService.getNextReporteNumber();
    const today = new Date().toISOString().split('T')[0];
    return {
      numeroReporte: nextNum,
      tipoServicio: 'CON CARGO',
      fechaReporte: today,
      atendio: 'ELIZABETH',
      nombreCliente: '',
      direccion: '',
      colonia: '',
      tipoCasa: '-',
      telefono: '',
      celular: '',
      aparato: 'REFRIGERADOR',
      marca: 'LG',
      modelo: '',
      serieDifusor: '',
      serieEquipo: '',
      fallaReportada: '',
      fechaVisita: today,
      horaVisita: 'TRANSCURSO DEL DIA',
      tecnico: 'JOAQUIN',
      detalles1erVisita: '',
      detalles2daVisita: '',
      detalles3eraVisita: '',
      presupuesto: 700,
      partesSolicitadas: '',
      numeroPedido: '',
      observaciones: 'CLIENTE DEPOSITO $700.00 DE REVISION',
      numeroOrdenServicio: '',
      informacionConfidencial: '',
    };
  };

  const [formData, setFormData] = useState<Partial<ReporteSitio>>(getBlankFormState());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper de Impresión Directa en iframe invisible
  const printDirectly = (htmlBody: string, docTitle: string) => {
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
              <title>${docTitle}</title>
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
                  font-size: 11.5px;
                  line-height: 1.4;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                * {
                  box-sizing: border-box;
                }
                .report-card {
                  border: 2px solid #2d264b;
                  border-radius: 4px;
                  overflow: hidden;
                }
                .header-bar {
                  background: #2d264b;
                  color: #ffffff;
                  padding: 8px 12px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .header-bar h2 {
                  margin: 0;
                  font-size: 14px;
                  font-weight: 900;
                  letter-spacing: 0.5px;
                }
                .report-num-box {
                  background: #ffffff;
                  color: #dc2626;
                  border: 2px solid #dc2626;
                  font-size: 20px;
                  font-weight: 900;
                  padding: 4px 16px;
                  border-radius: 4px;
                  text-align: center;
                  display: inline-block;
                }
                .band-title {
                  background: #2d264b;
                  color: #ffffff;
                  font-size: 10px;
                  font-weight: 800;
                  text-transform: uppercase;
                  padding: 4px 8px;
                  letter-spacing: 0.5px;
                }
                .field-row {
                  display: flex;
                  border-bottom: 1px solid #2d264b;
                }
                .field-col {
                  flex: 1;
                  border-right: 1px solid #2d264b;
                }
                .field-col:last-child {
                  border-right: none;
                }
                .field-label {
                  background: #2d264b;
                  color: #ffffff;
                  font-size: 9.5px;
                  font-weight: 800;
                  text-transform: uppercase;
                  padding: 3px 6px;
                  text-align: center;
                }
                .field-val {
                  padding: 6px 8px;
                  font-size: 12px;
                  min-height: 26px;
                  color: #0f172a;
                  font-weight: 600;
                }
                .red-val {
                  color: #dc2626;
                  font-weight: 800;
                }
                .green-box {
                  background-color: #16a34a;
                  color: #ffffff;
                  padding: 10px;
                  font-size: 11px;
                  font-weight: 600;
                  min-height: 50px;
                  white-space: pre-wrap;
                }
                .footer {
                  border-top: 1px solid #cbd5e1;
                  padding-top: 6px;
                  margin-top: 16px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 9.5px;
                  color: #64748b;
                }
              </style>
            </head>
            <body>
              ${htmlBody}
            </body>
          </html>
        `);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Error invoking print:', e);
            window.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1500);
          }
        }, 250);
      }
    } catch (err) {
      console.error('Fallback print:', err);
      window.print();
    }
  };

  // Preparar formulario en blanco para nuevo reporte
  const handleStartNewRegistration = () => {
    setEditingItem(null);
    setFormData(getBlankFormState());
    setMainView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Limpiar campos del formulario
  const handleClearForm = () => {
    setEditingItem(null);
    setFormData(getBlankFormState());
    showToast('✨ Formulario en blanco listo para nuevo reporte de cita.');
  };

  // Cargar registro para editar en el formulario
  const handleEditRecord = (item: ReporteSitio) => {
    setEditingItem(item);
    setFormData({ ...item });
    setMainView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`✏️ Editando reporte #${item.numeroReporte}.`);
  };

  // Navegación entre registros existentes
  const currentRecordIndex = useMemo(() => {
    if (!formData.numeroReporte) return -1;
    return reportes.findIndex(
      (r) =>
        r.id === editingItem?.id ||
        r.numeroReporte.trim().toLowerCase() === formData.numeroReporte?.trim().toLowerCase()
    );
  }, [reportes, editingItem, formData.numeroReporte]);

  const handleNavigateRecord = (direction: 'first' | 'prev' | 'next' | 'last') => {
    if (reportes.length === 0) return;

    let targetIndex = 0;
    if (direction === 'first') targetIndex = 0;
    else if (direction === 'last') targetIndex = reportes.length - 1;
    else if (direction === 'prev') {
      targetIndex = currentRecordIndex > 0 ? currentRecordIndex - 1 : 0;
    } else if (direction === 'next') {
      targetIndex =
        currentRecordIndex < reportes.length - 1 ? currentRecordIndex + 1 : reportes.length - 1;
    }

    const targetItem = reportes[targetIndex];
    if (targetItem) {
      setEditingItem(targetItem);
      setFormData({ ...targetItem });
      showToast(`Visualizando reporte #${targetItem.numeroReporte} (${targetIndex + 1} de ${reportes.length})`);
    }
  };

  // Guardar o Actualizar Reporte
  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.nombreCliente?.trim()) {
      showToast('⚠️ Por favor ingresa el Nombre del cliente.');
      return;
    }

    const now = new Date().toISOString();
    const repNum = formData.numeroReporte?.trim() || StorageService.getNextReporteNumber();

    const recordToSave: ReporteSitio = {
      id: editingItem ? editingItem.id : `rep-${Date.now()}`,
      numeroReporte: repNum,
      tipoServicio: formData.tipoServicio || 'CON CARGO',
      fechaReporte: formData.fechaReporte || new Date().toISOString().split('T')[0],
      atendio: formData.atendio || 'ELIZABETH',
      nombreCliente: formData.nombreCliente.trim(),
      direccion: formData.direccion?.trim() || '',
      colonia: formData.colonia?.trim() || '',
      tipoCasa: formData.tipoCasa || '-',
      telefono: formData.telefono?.trim() || '',
      celular: formData.celular?.trim() || '',
      aparato: formData.aparato?.trim() || 'REFRIGERADOR',
      marca: formData.marca?.trim() || 'LG',
      modelo: formData.modelo?.trim() || '',
      serieDifusor: formData.serieDifusor?.trim() || '',
      serieEquipo: formData.serieEquipo?.trim() || '',
      fallaReportada: formData.fallaReportada?.trim() || '',
      fechaVisita: formData.fechaVisita || new Date().toISOString().split('T')[0],
      horaVisita: formData.horaVisita || 'TRANSCURSO DEL DIA',
      tecnico: formData.tecnico || 'JOAQUIN',
      detalles1erVisita: formData.detalles1erVisita?.trim() || '',
      detalles2daVisita: formData.detalles2daVisita?.trim() || '',
      detalles3eraVisita: formData.detalles3eraVisita?.trim() || '',
      presupuesto: formData.presupuesto !== undefined ? formData.presupuesto : 700,
      partesSolicitadas: formData.partesSolicitadas?.trim() || '',
      numeroPedido: formData.numeroPedido?.trim() || '',
      observaciones: formData.observaciones?.trim() || 'CLIENTE DEPOSITO $700.00 DE REVISION',
      numeroOrdenServicio: formData.numeroOrdenServicio?.trim() || '',
      informacionConfidencial: formData.informacionConfidencial?.trim() || '',
      createdAt: editingItem ? editingItem.createdAt : now,
      updatedAt: now,
    };

    const updatedList = StorageService.saveReporteSitio(recordToSave);
    setReportes(updatedList);

    if (editingItem) {
      showToast(`✅ Reporte #${recordToSave.numeroReporte} actualizado correctamente.`);
      setEditingItem(null);
      setFormData(getBlankFormState());
    } else {
      showToast(`✅ Reporte #${recordToSave.numeroReporte} guardado con éxito.`);
      setFormData(getBlankFormState());
    }
  };

  // Duplicar Reporte
  const handleDuplicateRecord = (item: ReporteSitio) => {
    const nextNum = StorageService.getNextReporteNumber();
    const duplicated: ReporteSitio = {
      ...item,
      id: `rep-${Date.now()}`,
      numeroReporte: nextNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = StorageService.saveReporteSitio(duplicated);
    setReportes(updated);
    showToast(`📋 Reporte #${item.numeroReporte} duplicado como #${nextNum}.`);
  };

  // Eliminar Reporte
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const updated = StorageService.deleteReporteSitio(deleteCandidate.id);
    setReportes(updated);
    showToast(`🗑️ Reporte #${deleteCandidate.numeroReporte} eliminado permanentemente.`);
    setDeleteCandidate(null);
    if (editingItem?.id === deleteCandidate.id) {
      setEditingItem(null);
      setFormData(getBlankFormState());
    }
  };

  // Imprimir Ficha Oficial Individual
  const handlePrintSingle = (item: ReporteSitio) => {
    const html = `
      <div class="report-card">
        <!-- Header Bar -->
        <div style="background: #2d264b; padding: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2d264b;">
          <div style="color: #38bdf8; font-size: 16px; font-weight: 900; letter-spacing: 0.5px;">
            ${company.commercialName || 'CENTRO DE SERVICIO AUTORIZADO'}
          </div>
          <div style="text-align: center;">
            <div style="color: #ffffff; font-size: 13px; font-weight: 900; letter-spacing: 1px;"># DE REPORTE</div>
            <div class="report-num-box">${item.numeroReporte}</div>
          </div>
          <div style="color: #94a3b8; font-size: 10px; text-align: right;">
            Tel: ${company.phone || ''}<br/>
            RFC: ${company.rfc || ''}
          </div>
        </div>

        <!-- Row 1: Tipo Servicio, Fecha, Atendió -->
        <div class="field-row">
          <div class="field-col" style="flex: 1.2;">
            <div class="field-label">TIPO DE SERVICIO</div>
            <div class="field-val">${item.tipoServicio || 'CON CARGO'}</div>
          </div>
          <div class="field-col" style="flex: 1;">
            <div class="field-label">FECHA DE REPORTE</div>
            <div class="field-val">${item.fechaReporte || ''}</div>
          </div>
          <div class="field-col" style="flex: 1.2;">
            <div class="field-label">*ATENDIO*</div>
            <div class="field-val red-val">${item.atendio || ''}</div>
          </div>
        </div>

        <!-- Row 2: Nombre del Cliente -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">*NOMBRE DEL CLIENTE*</div>
            <div class="field-val" style="font-size: 13px;">${item.nombreCliente || ''}</div>
          </div>
        </div>

        <!-- Row 3: Dirección -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">*DIRECCION NUMERO DE CASA, ENTRE CALLES Y REFERENCIAS*</div>
            <div class="field-val">${item.direccion || ''}</div>
          </div>
        </div>

        <!-- Row 4: Colonia, Tipo Casa, Teléfono, Celular -->
        <div class="field-row">
          <div class="field-col" style="flex: 1.5;">
            <div class="field-label">COLONIA</div>
            <div class="field-val">${item.colonia || ''}</div>
          </div>
          <div class="field-col" style="flex: 1;">
            <div class="field-label">*TIPO DE CASA*</div>
            <div class="field-val">${item.tipoCasa || '-'}</div>
          </div>
          <div class="field-col" style="flex: 1.2;">
            <div class="field-label">TELEFONO</div>
            <div class="field-val">${item.telefono || '--'}</div>
          </div>
          <div class="field-col" style="flex: 1.2;">
            <div class="field-label">CELULAR</div>
            <div class="field-val red-val">${item.celular || '--'}</div>
          </div>
        </div>

        <!-- Row 5: Aparato, Marca, Modelo -->
        <div class="field-row">
          <div class="field-col" style="flex: 1.5;">
            <div class="field-label">APARATO</div>
            <div class="field-val">${item.aparato || ''}</div>
          </div>
          <div class="field-col" style="flex: 1;">
            <div class="field-label">MARCA</div>
            <div class="field-val red-val">${item.marca || ''}</div>
          </div>
          <div class="field-col" style="flex: 1.5;">
            <div class="field-label">MODELO</div>
            <div class="field-val">${item.modelo || ''}</div>
          </div>
        </div>

        <!-- Row 6: Serie Difusor, Serie Equipo -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">SERIE DEL DIFUSOR</div>
            <div class="field-val">${item.serieDifusor || '--'}</div>
          </div>
          <div class="field-col" style="flex: 1;">
            <div class="field-label">SERIE DEL EQUIPO</div>
            <div class="field-val">${item.serieEquipo || '--'}</div>
          </div>
        </div>

        <!-- Row 7: Falla que Reporta el Cliente -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">FALLA QUE REPORTA EL CLIENTE</div>
            <div class="field-val" style="min-height: 36px;">${item.fallaReportada || ''}</div>
          </div>
        </div>

        <!-- Row 8: Fecha de Visita, Hora de Visita, Técnico -->
        <div class="field-row">
          <div class="field-col" style="flex: 1.5;">
            <div class="field-label">FECHA DE VISITA</div>
            <div class="field-val red-val">${item.fechaVisita || ''}</div>
          </div>
          <div class="field-col" style="flex: 1.5;">
            <div class="field-label">HORA DE VISITA</div>
            <div class="field-val red-val">${item.horaVisita || ''}</div>
          </div>
          <div class="field-col" style="flex: 1.2;">
            <div class="field-label">TECNICO:</div>
            <div class="field-val">${item.tecnico || ''}</div>
          </div>
        </div>

        <!-- Row 9: Detalles 1ra Visita -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">DETALLES DE 1ER VISITA</div>
            <div class="field-val" style="min-height: 44px; white-space: pre-wrap;">${item.detalles1erVisita || ''}</div>
          </div>
        </div>

        <!-- Row 10: 2da Visita, 3ra Visita -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">2DA VISITA</div>
            <div class="field-val" style="min-height: 40px; white-space: pre-wrap;">${item.detalles2daVisita || ''}</div>
          </div>
          <div class="field-col" style="flex: 1;">
            <div class="field-label">3ERA VISITA</div>
            <div class="field-val" style="min-height: 40px; white-space: pre-wrap;">${item.detalles3eraVisita || ''}</div>
          </div>
        </div>

        <!-- Row 11: Presupuesto, Partes Solicitadas -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">PRESUPUESTO:</div>
            <div class="field-val" style="min-height: 45px; white-space: pre-wrap; font-size: 13px;">${typeof item.presupuesto === 'number' ? `$${item.presupuesto.toFixed(2)} MXN` : (item.presupuesto || '')}</div>
          </div>
          <div class="field-col" style="flex: 1.2;">
            <div class="field-label">PARTES SOLICITADAS</div>
            <div class="field-val" style="min-height: 45px; white-space: pre-wrap;">${item.partesSolicitadas || ''}</div>
          </div>
        </div>

        <!-- Row 12: # de Pedido -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label"># DE PEDIDO</div>
            <div class="field-val">${item.numeroPedido || '--'}</div>
          </div>
        </div>

        <!-- Row 13: Observaciones -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">OBSERVACIONES</div>
            <div class="field-val">${item.observaciones || ''}</div>
          </div>
        </div>

        <!-- Row 14: Número de Orden de Servicio -->
        <div class="field-row">
          <div class="field-col" style="flex: 1;">
            <div class="field-label">NUMERO DE ORDEN DE SERVICIO</div>
            <div class="field-val">${item.numeroOrdenServicio || '--'}</div>
          </div>
        </div>

        <!-- Row 15: Información Confidencial (Green Box) -->
        <div>
          <div class="field-label" style="background: #1e1b4b;">INFORMACION CONFIDENCIAL</div>
          <div class="green-box">${item.informacionConfidencial || 'Sin notas confidenciales registradas'}</div>
        </div>
      </div>

      <div class="footer">
        <div>${company.name || 'ServiTrack Pro'} • Control Oficial de Citas y Servicio en Sitio</div>
        <div>Fecha de Impresión: ${new Date().toLocaleDateString('es-MX')}</div>
      </div>
    `;

    printDirectly(html, `Reporte_Cita_${item.numeroReporte}`);
  };

  // Exportar a Excel (.xlsx)
  const handleExportExcel = () => {
    if (reportes.length === 0) {
      showToast('⚠️ No hay reportes para exportar a Excel.');
      return;
    }

    const dataToExport = filteredReportes.map((r) => ({
      '# DE REPORTE': r.numeroReporte,
      'TIPO DE SERVICIO': r.tipoServicio,
      'FECHA DE REPORTE': r.fechaReporte,
      'ATENDIÓ': r.atendio,
      'NOMBRE DEL CLIENTE': r.nombreCliente,
      'DIRECCIÓN': r.direccion,
      'COLONIA': r.colonia,
      'TIPO DE CASA': r.tipoCasa,
      'TELÉFONO': r.telefono,
      'CELULAR': r.celular,
      'APARATO': r.aparato,
      'MARCA': r.marca,
      'MODELO': r.modelo,
      'SERIE DIFUSOR': r.serieDifusor,
      'SERIE EQUIPO': r.serieEquipo,
      'FALLA REPORTADA': r.fallaReportada,
      'FECHA DE VISITA': r.fechaVisita,
      'HORA DE VISITA': r.horaVisita,
      'TÉCNICO': r.tecnico,
      '1RA VISITA': r.detalles1erVisita,
      '2DA VISITA': r.detalles2daVisita,
      '3RA VISITA': r.detalles3eraVisita,
      'PRESUPUESTO': r.presupuesto,
      'PARTES SOLICITADAS': r.partesSolicitadas,
      '# DE PEDIDO': r.numeroPedido,
      'OBSERVACIONES': r.observaciones,
      'ORDEN DE SERVICIO': r.numeroOrdenServicio,
      'INFORMACIÓN CONFIDENCIAL': r.informacionConfidencial,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Citas y Reportes');
    XLSX.writeFile(workbook, `Reportes_Citas_Servicio_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('📊 Reportes exportados a Excel (.xlsx) exitosamente.');
  };

  // Helper de Normalización de Texto para Búsqueda
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Algoritmo de Búsqueda de Reportes
  const filteredReportes = useMemo(() => {
    if (!searchQuery.trim()) return reportes;

    const rawQuery = searchQuery.trim();
    const normQuery = normalizeText(rawQuery);
    const cleanDigits = rawQuery.replace(/\D/g, '');

    // Caso 1: Búsqueda explícita de ID con prefijo (ej. "#11740", "id: 11740", "rep-11740", "r11740")
    const explicitIdMatch = rawQuery.match(/^(?:#|id\s*:?\s*|rep-?|r)?(\d+)$/i);
    if (explicitIdMatch) {
      const targetNumber = explicitIdMatch[1];
      return reportes.filter((r) => {
        const rNum = (r.numeroReporte || '').trim();
        const rNumClean = rNum.replace(/\D/g, '');
        return rNum === targetNumber || rNumClean === targetNumber;
      });
    }

    // Caso 2: El usuario escribió un número entero (ej. "11740", "1", "2")
    if (/^\d+$/.test(rawQuery)) {
      if (rawQuery.length <= 5) {
        // Coincidencia exacta de número de reporte
        return reportes.filter((r) => {
          const rNum = (r.numeroReporte || '').trim();
          const rNumClean = rNum.replace(/\D/g, '');
          return rNum === rawQuery || rNumClean === rawQuery;
        });
      }

      // Si son 6 o más dígitos (ej. "6622111124"): Búsqueda de teléfono / celular o número de serie
      return reportes.filter((r) => {
        const rNum = (r.numeroReporte || '').trim();
        if (rNum === rawQuery) return true;

        const cleanTel = (r.telefono || '').replace(/\D/g, '');
        const cleanCel = (r.celular || '').replace(/\D/g, '');
        const cleanSerie = (r.serieEquipo || '').replace(/\D/g, '');

        return (
          (cleanTel && cleanTel.includes(cleanDigits)) ||
          (cleanCel && cleanCel.includes(cleanDigits)) ||
          (cleanSerie && cleanSerie.includes(cleanDigits))
        );
      });
    }

    // Caso 3: Búsqueda de Texto General
    const tokens = normQuery.split(/\s+/).filter(Boolean);

    return reportes.filter((r) => {
      const rNum = (r.numeroReporte || '').trim().toLowerCase();
      if (rNum === normQuery || `#${rNum}` === normQuery) {
        return true;
      }

      const searchableString = [
        r.numeroReporte,
        r.nombreCliente,
        r.direccion,
        r.colonia,
        r.aparato,
        r.marca,
        r.modelo,
        r.serieEquipo,
        r.tecnico,
        r.atendio,
        r.fallaReportada,
        r.observaciones,
        r.tipoServicio,
      ]
        .map((field) => normalizeText(field || ''))
        .join(' ');

      return tokens.every((token) => searchableString.includes(token));
    });
  }, [reportes, searchQuery]);

  // Reset de página al cambiar búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Cálculos de Paginación
  const totalItems = filteredReportes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedReportes = useMemo(() => {
    return filteredReportes.slice(startIndex, endIndex);
  }, [filteredReportes, startIndex, endIndex]);

  const hasMorePages = totalPages > 1;
  const remainingItems = totalItems - endIndex;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Principal con Conmutador Claro entre FORMULARIO y BUSCADOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Módulo de Servicio en Sitio
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {reportes.length} reportes guardados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            Citas a Clientes ( Reportes )
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {mainView === 'create'
              ? editingItem
                ? `Editando reporte #${formData.numeroReporte}`
                : 'Formulario oficial para registro y programación de citas a domicilio.'
              : 'Directorio general y buscador de reportes de servicio.'}
          </p>
        </div>

        {/* Botonera de Navegación de Vistas */}
        <div className="flex flex-wrap items-center gap-2">
          {mainView === 'create' ? (
            <button
              onClick={() => {
                setMainView('directory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="btn-ir-a-buscar-reportes"
              className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer border border-slate-800"
              title="Ir al buscador y listado de reportes"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Buscador de Registros</span>
              <span className="bg-slate-800 text-indigo-300 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ml-1">
                {reportes.length}
              </span>
            </button>
          ) : (
            <button
              onClick={handleStartNewRegistration}
              id="btn-ir-a-nuevo-reporte"
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Abrir formulario en blanco para nueva cita"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Reporte</span>
            </button>
          )}

          {/* Exportación de Datos */}
          <button
            onClick={handleExportExcel}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Exportar base de datos a archivo Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: FORMULARIO PRINCIPAL DE REGISTRO (DISEÑO OFICIAL DE LA IMAGEN) */}
      {/* ========================================================================= */}
      {mainView === 'create' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* BARRA DE NAVEGACIÓN Y ACCIONES DE BASE DE DATOS */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Controles de Navegación entre Registros */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleNavigateRecord('first')}
                disabled={reportes.length === 0 || currentRecordIndex === 0}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Primer registro"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigateRecord('prev')}
                disabled={reportes.length === 0 || currentRecordIndex <= 0}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Registro anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Reporte</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {currentRecordIndex >= 0 ? currentRecordIndex + 1 : 'Nuevo'}
                </span>
                <span>de</span>
                <span className="font-mono font-bold">{reportes.length}</span>
              </div>

              <button
                type="button"
                onClick={() => handleNavigateRecord('next')}
                disabled={reportes.length === 0 || currentRecordIndex >= reportes.length - 1}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Registro siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigateRecord('last')}
                disabled={reportes.length === 0 || currentRecordIndex === reportes.length - 1}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Último registro"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Acciones Rápidas del Registro Actual */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Limpiar campos para nuevo registro en blanco"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>En Blanco</span>
              </button>

              {editingItem && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateRecord(editingItem)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Duplicar este reporte"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Duplicar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintSingle(editingItem)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Imprimir formato oficial de este reporte"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const doc = ExportService.generateReporteSitioPdf(editingItem, company);
                      doc.save(`Reporte_${editingItem.numeroReporte}.pdf`);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Exportar a PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-600" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(editingItem)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Eliminar este reporte"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleSaveForm()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Actualizar Reporte' : 'Guardar Reporte'}</span>
              </button>
            </div>
          </div>

          {/* FICHA OFICIAL DE CAPTURA - REPLICA EXACTA DEL FORMATO EN IMÁGENES */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveForm();
            }}
            className="bg-[#2D2A4A] p-3 sm:p-4 rounded-xl border-2 border-[#1E1B38] shadow-lg text-slate-900 space-y-1.5"
          >
            {/* Top Bar: Logo/Cyan area & # DE REPORTE */}
            <div className="bg-[#2D2A4A] flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 pt-1 border-b border-indigo-900/60">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-cyan-400 rounded flex items-center justify-center font-black text-slate-900 shadow-inner">
                  <Truck className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    {company.commercialName || 'SERVICIOS TÉCNICOS EN SITIO'}
                  </h3>
                  <p className="text-[11px] text-cyan-300">Hoja Oficial de Cita a Domicilio</p>
                </div>
              </div>

              {/* # DE REPORTE (Destacado en Rojo sobre Fondo Blanco) */}
              <div className="flex flex-col items-center">
                <div className="text-white text-xs font-black tracking-wider uppercase px-2 py-0.5">
                  # DE REPORTE
                </div>
                <div className="bg-white border-2 border-red-600 rounded px-4 py-1 flex items-center justify-center shadow-xs">
                  <input
                    type="text"
                    required
                    value={formData.numeroReporte || ''}
                    onChange={(e) => setFormData({ ...formData, numeroReporte: e.target.value })}
                    className="text-xl sm:text-2xl font-black text-red-600 text-center tracking-tight bg-transparent focus:outline-none w-32"
                    placeholder="11740"
                  />
                </div>
              </div>
            </div>

            {/* FILA 1: TIPO DE SERVICIO | FECHA DE REPORTE | *ATENDIO* */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  TIPO DE SERVICIO
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.tipoServicio || 'CON CARGO'}
                    onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                  >
                    {TIPO_SERVICIO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  FECHA DE REPORTE
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="date"
                    value={formData.fechaReporte || ''}
                    onChange={(e) => setFormData({ ...formData, fechaReporte: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-800 text-center py-1 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  *ATENDIO*
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.atendio || 'ELIZABETH'}
                    onChange={(e) => setFormData({ ...formData, atendio: e.target.value })}
                    className="w-full text-xs font-bold text-red-600 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  >
                    {ATENDIO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* FILA 2: *NOMBRE DEL CLIENTE* */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                *NOMBRE DEL CLIENTE*
              </div>
              <div className="p-1 bg-white">
                <input
                  type="text"
                  required
                  value={formData.nombreCliente || ''}
                  onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                  placeholder="Ej. R11740 Lizbet Chávez"
                  className="w-full text-xs sm:text-sm font-bold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* FILA 3: *DIRECCION NUMERO DE CASA, ENTRE CALLES Y REFERENCIAS* */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                *DIRECCION NUMERO DE CASA, ENTRE CALLES Y REFERENCIAS*
              </div>
              <div className="p-1 bg-white">
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej. Cochise#66 clave de ACCESO"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* FILA 4: COLONIA | *TIPO DE CASA* | TELEFONO | CELULAR */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  COLONIA
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="text"
                    value={formData.colonia || ''}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                    placeholder="Ej. EL APACHE"
                    className="w-full text-xs font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  *TIPO DE CASA*
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.tipoCasa || '-'}
                    onChange={(e) => setFormData({ ...formData, tipoCasa: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  >
                    {TIPO_CASA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  TELEFONO
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="text"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Teléfono fijo"
                    className="w-full text-xs font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  CELULAR
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="text"
                    value={formData.celular || ''}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    placeholder="Ej. 6622111124"
                    className="w-full text-xs font-bold text-red-600 text-center py-1.5 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* FILA 5: APARATO | MARCA | MODELO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  APARATO
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.aparato || 'REFRIGERADOR'}
                    onChange={(e) => setFormData({ ...formData, aparato: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  >
                    {APARATO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  MARCA
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.marca || 'LG'}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full text-xs font-bold text-red-600 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  >
                    {MARCA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  MODELO
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="text"
                    value={formData.modelo || ''}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ej. LS74BXP"
                    className="w-full text-xs font-bold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  />
                </div>
              </div>
            </div>

            {/* FILA 6: SERIE DEL DIFUSOR | SERIE DEL EQUIPO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  SERIE DEL DIFUSOR
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="text"
                    value={formData.serieDifusor || ''}
                    onChange={(e) => setFormData({ ...formData, serieDifusor: e.target.value })}
                    placeholder="Número de serie difusor"
                    className="w-full text-xs font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  SERIE DEL EQUIPO
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="text"
                    value={formData.serieEquipo || ''}
                    onChange={(e) => setFormData({ ...formData, serieEquipo: e.target.value })}
                    placeholder="Ej. 003MRSS14470"
                    className="w-full text-xs font-bold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* FILA 7: FALLA QUE REPORTA EL CLIENTE */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                FALLA QUE REPORTA EL CLIENTE
              </div>
              <div className="p-1 bg-white">
                <input
                  type="text"
                  value={formData.fallaReportada || ''}
                  onChange={(e) => setFormData({ ...formData, fallaReportada: e.target.value })}
                  placeholder="Ej. sonido en abanico o compresor"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* FILA 8: FECHA DE VISITA | HORA DE VISITA | TECNICO: */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  FECHA DE VISITA
                </div>
                <div className="p-1 bg-white">
                  <input
                    type="date"
                    value={formData.fechaVisita || ''}
                    onChange={(e) => setFormData({ ...formData, fechaVisita: e.target.value })}
                    className="w-full text-xs font-bold text-red-600 text-center py-1 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  HORA DE VISITA
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.horaVisita || 'TRANSCURSO DEL DIA'}
                    onChange={(e) => setFormData({ ...formData, horaVisita: e.target.value })}
                    className="w-full text-xs font-bold text-red-600 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  >
                    {HORA_VISITA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  TECNICO:
                </div>
                <div className="p-1 bg-white">
                  <select
                    value={formData.tecnico || 'JOAQUIN'}
                    onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent uppercase"
                  >
                    {TECNICO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* FILA 9: DETALLES DE 1ER VISITA */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                DETALLES DE 1ER VISITA
              </div>
              <div className="p-1.5 bg-white">
                <textarea
                  rows={2}
                  value={formData.detalles1erVisita || ''}
                  onChange={(e) => setFormData({ ...formData, detalles1erVisita: e.target.value })}
                  placeholder="Detalles y acciones realizadas durante la primera visita técnica..."
                  className="w-full text-xs text-slate-800 p-1 focus:outline-none bg-transparent resize-y"
                />
              </div>
            </div>

            {/* FILA 10: 2DA VISITA | 3ERA VISITA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  2DA VISITA
                </div>
                <div className="p-1.5 bg-white">
                  <textarea
                    rows={2}
                    value={formData.detalles2daVisita || ''}
                    onChange={(e) => setFormData({ ...formData, detalles2daVisita: e.target.value })}
                    placeholder="Detalles de la segunda visita técnica..."
                    className="w-full text-xs text-slate-800 p-1 focus:outline-none bg-transparent resize-y"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  3ERA VISITA
                </div>
                <div className="p-1.5 bg-white">
                  <textarea
                    rows={2}
                    value={formData.detalles3eraVisita || ''}
                    onChange={(e) => setFormData({ ...formData, detalles3eraVisita: e.target.value })}
                    placeholder="Detalles de la tercera visita técnica..."
                    className="w-full text-xs text-slate-800 p-1 focus:outline-none bg-transparent resize-y"
                  />
                </div>
              </div>
            </div>

            {/* FILA 11: PRESUPUESTO: | PARTES SOLICITADAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  PRESUPUESTO:
                </div>
                <div className="p-1.5 bg-white">
                  <textarea
                    rows={2}
                    value={formData.presupuesto !== undefined ? String(formData.presupuesto) : ''}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    placeholder="Monto de presupuesto o desglose financiero..."
                    className="w-full text-xs font-semibold text-slate-800 p-1 focus:outline-none bg-transparent resize-y"
                  />
                </div>
              </div>

              <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
                <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  PARTES SOLICITADAS
                </div>
                <div className="p-1.5 bg-white">
                  <textarea
                    rows={2}
                    value={formData.partesSolicitadas || ''}
                    onChange={(e) => setFormData({ ...formData, partesSolicitadas: e.target.value })}
                    placeholder="Lista de refacciones requeridas..."
                    className="w-full text-xs text-slate-800 p-1 focus:outline-none bg-transparent resize-y"
                  />
                </div>
              </div>
            </div>

            {/* FILA 12: # DE PEDIDO */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                # DE PEDIDO
              </div>
              <div className="p-1 bg-white">
                <input
                  type="text"
                  value={formData.numeroPedido || ''}
                  onChange={(e) => setFormData({ ...formData, numeroPedido: e.target.value })}
                  placeholder="Número de pedido / requisición"
                  className="w-full text-xs font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* FILA 13: OBSERVACIONES */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                OBSERVACIONES
              </div>
              <div className="p-1 bg-white">
                <input
                  type="text"
                  value={formData.observaciones || ''}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Ej. CLIENTE DEPOSITO $700.00 DE REVISION"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* FILA 14: NUMERO DE ORDEN DE SERVICIO */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                NUMERO DE ORDEN DE SERVICIO
              </div>
              <div className="p-1 bg-white">
                <input
                  type="text"
                  value={formData.numeroOrdenServicio || ''}
                  onChange={(e) => setFormData({ ...formData, numeroOrdenServicio: e.target.value })}
                  placeholder="Número de orden de servicio ligada"
                  className="w-full text-xs font-semibold text-slate-800 text-center py-1.5 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* FILA 15: INFORMACION CONFIDENCIAL (RECUADRO VERDE ESMERALDA) */}
            <div className="bg-[#2D2A4A] border border-indigo-900/80 rounded overflow-hidden">
              <div className="bg-[#1F1B38] text-white text-[10px] sm:text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                INFORMACION CONFIDENCIAL
              </div>
              <div className="p-2 bg-[#16A34A] rounded-b">
                <textarea
                  rows={3}
                  value={formData.informacionConfidencial || ''}
                  onChange={(e) => setFormData({ ...formData, informacionConfidencial: e.target.value })}
                  placeholder="Notas internas, códigos de acceso, referencias de caseta o indicaciones confidenciales..."
                  className="w-full text-xs font-medium text-white placeholder:text-emerald-200 focus:outline-none bg-transparent resize-y"
                />
              </div>
            </div>

            {/* BOTÓN FINAL DE GUARDAR */}
            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Limpiar Formulario
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Actualizar Reporte' : 'Guardar Reporte'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: BUSCADOR Y DIRECTORIO GENERAL DE CITAS Y REPORTES */}
      {/* ========================================================================= */}
      {mainView === 'directory' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Barra de Búsqueda y Modos de Vista */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Input de Búsqueda */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por # de Reporte (ej. 11740), Cliente, Celular, Marca, Aparato, Técnico o Dirección..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Selector de Modo de Visualización (Horizontal / Tabla / Cuadrícula) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('horizontal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'horizontal'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Vista Horizontal (1 columna en móvil)"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Vista Tabla"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tabla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Vista Cuadrícula (1 columna en móvil)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cuadrícula</span>
                </button>
              </div>
            </div>

            {/* Info de Resultados y Filtros Rápidos */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span>
                  Mostrando{' '}
                  <strong className="text-slate-800 font-bold">
                    {totalItems === 0 ? 0 : startIndex + 1} - {endIndex}
                  </strong>{' '}
                  de <strong className="text-slate-800 font-bold">{totalItems}</strong> reportes
                </span>
                {searchQuery && (
                  <span className="text-indigo-600 font-medium">
                    (filtrado de {reportes.length} totales)
                  </span>
                )}
              </div>

              {/* Botón rápido para nuevo reporte */}
              <button
                onClick={handleStartNewRegistration}
                className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Capturar Nuevo Reporte</span>
              </button>
            </div>
          </div>

          {/* ESTADO SIN RESULTADOS */}
          {filteredReportes.length === 0 && (
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay reportes registrados'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {searchQuery
                    ? 'No se encontró ningún reporte con este número, cliente o criterio de búsqueda.'
                    : 'Aún no se han guardado reportes de citas a clientes en el sistema.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Limpiar Buscador
                  </button>
                )}
                <button
                  onClick={handleStartNewRegistration}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Registrar Nuevo Reporte</span>
                </button>
              </div>
            </div>
          )}

          {/* VISTA 1: MODO HORIZONTAL (TARJETAS EN 1 COLUMNA EN MÓVIL) */}
          {filteredReportes.length > 0 && viewMode === 'horizontal' && (
            <div className="grid grid-cols-1 gap-3">
              {paginatedReportes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all space-y-3 group"
                >
                  {/* Fila Superior: Badge # de Reporte, Tipo, Cliente y Botones */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="bg-[#2D2A4A] text-white px-2.5 py-1 rounded-lg font-mono font-black text-xs flex items-center gap-1">
                        <span className="text-indigo-300">#</span>
                        <span className="text-red-400 text-sm font-bold">{item.numeroReporte}</span>
                      </div>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        {item.tipoServicio || 'CON CARGO'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.nombreCliente}
                      </h3>
                    </div>

                    {/* Botonera de Acciones por Registro */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handlePrintSingle(item)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Imprimir ficha de reporte"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const doc = ExportService.generateReporteSitioPdf(item, company);
                          doc.save(`Reporte_${item.numeroReporte}.pdf`);
                        }}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRecord(item)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Duplicar reporte"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRecord(item)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Editar reporte"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(item)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar reporte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Grid de Información Principal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Domicilio */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Dirección & Colonia
                      </p>
                      <p className="font-semibold text-slate-800 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{item.direccion || 'Sin dirección'}</span>
                      </p>
                      <p className="text-slate-500 pl-4">{item.colonia || 'Colonia no especificada'}</p>
                    </div>

                    {/* Contacto */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Teléfonos
                      </p>
                      <p className="font-bold text-red-600 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{item.celular || 'Sin celular'}</span>
                      </p>
                      {item.telefono && (
                        <p className="text-slate-500 pl-4 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{item.telefono}</span>
                        </p>
                      )}
                    </div>

                    {/* Equipo y Falla */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Aparato & Marca
                      </p>
                      <p className="font-bold text-slate-800">
                        {item.aparato} • <span className="text-red-600">{item.marca}</span>
                      </p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Mod: {item.modelo || 'N/A'} {item.serieEquipo ? `• S/N: ${item.serieEquipo}` : ''}
                      </p>
                    </div>

                    {/* Visita & Técnico */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Visita Programada
                      </p>
                      <p className="font-bold text-indigo-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{item.fechaVisita}</span>
                      </p>
                      <p className="text-slate-500 font-medium">
                        {item.horaVisita} • <strong className="text-slate-700">{item.tecnico}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Falla & Observaciones (si existen) */}
                  {(item.fallaReportada || item.observaciones) && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-bold text-slate-700">Falla: </span>
                        <span className="text-slate-600">{item.fallaReportada || 'No descrita'}</span>
                      </div>
                      {item.observaciones && (
                        <div className="text-[11px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                          {item.observaciones}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VISTA 2: MODO TABLA */}
          {filteredReportes.length > 0 && viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#2D2A4A] text-white font-bold text-[10px] uppercase tracking-wider">
                      <th className="p-3"># Reporte</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Celular</th>
                      <th className="p-3">Aparato / Marca</th>
                      <th className="p-3">Visita</th>
                      <th className="p-3">Técnico</th>
                      <th className="p-3">Observaciones</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedReportes.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-red-600">
                          #{item.numeroReporte}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          <div>{item.nombreCliente}</div>
                          <div className="text-[10px] text-slate-400">{item.colonia}</div>
                        </td>
                        <td className="p-3 font-bold text-red-600">{item.celular || '--'}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700">{item.aparato}</span>{' '}
                          <span className="text-red-600 font-bold">{item.marca}</span>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div>{item.fechaVisita}</div>
                          <div className="text-[10px] text-slate-400">{item.horaVisita}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{item.tecnico}</td>
                        <td className="p-3 text-slate-500 max-w-[200px] truncate">
                          {item.observaciones || '--'}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handlePrintSingle(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Imprimir"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditRecord(item)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(item)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 3: MODO CUADRÍCULA (1 COLUMNA EN MÓVIL, 2 EN TABLET, 3 EN DESKTOP) */}
          {filteredReportes.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedReportes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="bg-[#2D2A4A] text-white px-2 py-0.5 rounded font-mono font-bold text-xs">
                        #{item.numeroReporte}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {item.tipoServicio}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.nombreCliente}</h4>
                      <p className="text-xs text-slate-500 truncate">{item.direccion || item.colonia}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Celular:</span>
                        <span className="font-bold text-red-600">{item.celular || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aparato:</span>
                        <span className="font-semibold text-slate-700">
                          {item.aparato} ({item.marca})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Visita:</span>
                        <span className="font-semibold text-indigo-700">{item.fechaVisita}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Técnico:</span>
                        <span className="font-bold text-slate-800">{item.tecnico}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePrintSingle(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                        title="Imprimir"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRecord(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleEditRecord(item)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                    >
                      Ver / Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación Completa */}
          {hasMorePages && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
              <div className="text-slate-500">
                Página <strong className="text-slate-800 font-bold">{validCurrentPage}</strong> de{' '}
                <strong className="text-slate-800 font-bold">{totalPages}</strong> ({totalItems} reportes)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - validCurrentPage) <= 1
                    )
                    .map((pageNum, idx, arr) => {
                      const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg font-bold transition-all ${
                              validCurrentPage === pageNum
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                ¿Eliminar reporte #{deleteCandidate.numeroReporte}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción eliminará el registro de <strong>{deleteCandidate.nombreCliente}</strong>{' '}
                permanentemente de la base de datos.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
