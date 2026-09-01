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
  User,
  Home,
} from 'lucide-react';
import { ReporteSitio, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { WhatsAppShareMenu } from './WhatsAppShareMenu';
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

  // Helper de Impresión Directa en iframe invisible (Diseño Sencillo, Formal y Minimalista)
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
                  border-radius: 5px;
                  padding: 7px 10px;
                  margin-bottom: 6px;
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
                  font-size: 11.5px;
                  font-weight: 700;
                  color: #0f172a;
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
                .notes-box {
                  background: #f8fafc;
                  border: 1px solid #cbd5e1;
                  border-radius: 5px;
                  padding: 8px 10px;
                  font-size: 10.5px;
                  color: #1e293b;
                  line-height: 1.4;
                  white-space: pre-wrap;
                }
                .confidential-box {
                  background: #f0fdf4;
                  border: 1px solid #86efac;
                  border-radius: 5px;
                  padding: 8px 10px;
                  font-size: 10.5px;
                  color: #166534;
                  line-height: 1.4;
                  white-space: pre-wrap;
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
                  font-size: 9.5px;
                  color: #94a3b8;
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

  // Imprimir Ficha Oficial Individual (Formato Minimalista y Formal)
  const handlePrintSingle = (item: ReporteSitio) => {
    const html = `
      <div class="header">
        <div>
          <div class="company-name">${company.commercialName || 'CENTRO DE SERVICIO AUTORIZADO'}</div>
          <div class="doc-title">REPORTE TÉCNICO DE CITA Y SERVICIO EN SITIO</div>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
            ${company.address || ''} • Tel: ${company.phone || ''} • RFC: ${company.rfc || ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="badge">REPORTE: #${item.numeroReporte}</div>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">
            Fecha: ${item.fechaReporte || new Date().toLocaleDateString('es-MX')}
          </div>
        </div>
      </div>

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
          <div class="field-value" style="font-family: monospace;">${item.serieDifusor || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Serie del Equipo</div>
          <div class="field-value" style="font-family: monospace;">${item.serieEquipo || 'N/A'}</div>
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
          <div class="field-value">${typeof item.presupuesto === 'number' ? `$${item.presupuesto.toFixed(2)} MXN` : item.presupuesto || 'N/A'}</div>
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
        <div class="box">
          <div class="field-label">Observaciones Generales</div>
          <div class="field-value" style="font-weight: 500; font-size: 10.5px;">${item.observaciones}</div>
        </div>
      `
          : ''
      }

      ${
        item.informacionConfidencial
          ? `
        <div class="section-title">7. Información Confidencial / Accesos y Referencias</div>
        <div class="confidential-box">
          ${item.informacionConfidencial}
        </div>
      `
          : ''
      }

      <div class="signatures">
        <div class="sign-line">
          ${item.tecnico || 'Técnico Responsable'} • Firma de Técnico
        </div>
        <div class="sign-line">
          Firma de Conformidad del Cliente
        </div>
      </div>

      <div class="footer">
        <div>${company.name || 'ServiTrack Pro'} • RFC: ${company.rfc || ''}</div>
        <div>Ficha Oficial de Citas a Domicilio • Página 1 de 1</div>
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

  // Listener para acciones globales de navegación rápida (Móvil / Bottom Bar)
  useEffect(() => {
    const handleAppAction = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.view === 'create') {
        handleStartNewRegistration();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (customEvt.detail?.view === 'directory') {
        setMainView('directory');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('app:switch-view', handleAppAction);
    return () => window.removeEventListener('app:switch-view', handleAppAction);
  }, []);

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
      {/* VISTA 1: FORMULARIO EN BLANCO PARA REGISTRAR NUEVA CITA / REPORTE */}
      {/* ========================================================================= */}
      {mainView === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          {/* Form Banner Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  {editingItem ? 'Editar Reporte de Cita en Sitio' : 'Registrar Nueva Cita a Cliente (Reporte)'}
                </h2>
                <p className="text-xs text-slate-400">
                  {editingItem
                    ? 'Modifica los datos del reporte técnico y guarda los cambios.'
                    : 'Captura los datos del cliente, equipo, falla reportada y programación de visita.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {/* Controles de Navegación Compactos entre Registros */}
              <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleNavigateRecord('first')}
                  disabled={reportes.length === 0 || currentRecordIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Primer reporte"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateRecord('prev')}
                  disabled={reportes.length === 0 || currentRecordIndex <= 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Reporte anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-slate-300 px-2">
                  {currentRecordIndex >= 0 ? `${currentRecordIndex + 1} / ${reportes.length}` : 'Nuevo'}
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateRecord('next')}
                  disabled={reportes.length === 0 || currentRecordIndex >= reportes.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Reporte siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateRecord('last')}
                  disabled={reportes.length === 0 || currentRecordIndex === reportes.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Último reporte"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 font-medium">Asignación #:</span>
                <span className="font-mono font-black text-indigo-400">#{formData.numeroReporte || 'N/A'}</span>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1.5 bg-amber-950/40 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveForm();
            }}
            className="p-5 sm:p-7 space-y-6"
          >
            {/* Sección 1: Identidad del Reporte y Cliente */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Identidad del Reporte y Cliente
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* # de Reporte */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    # de Reporte <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="form-numeroReporte"
                    value={formData.numeroReporte || ''}
                    onChange={(e) => setFormData({ ...formData, numeroReporte: e.target.value })}
                    placeholder="Ej. 11740"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-mono font-bold text-slate-900 transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Consecutivo oficial editable.</span>
                </div>

                {/* Tipo de Servicio */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo de Servicio
                  </label>
                  <select
                    id="form-tipoServicio"
                    value={formData.tipoServicio || 'CON CARGO'}
                    onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-slate-900 transition-all"
                  >
                    {TIPO_SERVICIO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Reporte */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fecha de Reporte
                  </label>
                  <input
                    type="date"
                    id="form-fechaReporte"
                    value={formData.fechaReporte || ''}
                    onChange={(e) => setFormData({ ...formData, fechaReporte: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-medium"
                  />
                </div>

                {/* Personal que Atendió */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Atendió Solicitud (*ATENDIO*)
                  </label>
                  <select
                    id="form-atendio"
                    value={formData.atendio || 'ELIZABETH'}
                    onChange={(e) => setFormData({ ...formData, atendio: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-slate-900 transition-all"
                  >
                    {ATENDIO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre del Cliente */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre del Cliente / Solicitante <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      id="form-nombreCliente"
                      value={formData.nombreCliente || ''}
                      onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                      placeholder="Ej. R11740 Lizbet Chávez / Lic. Fernando Zúñiga"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-slate-900 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Ubicación y Contacto del Domicilio */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Ubicación y Datos de Contacto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Dirección y Referencias */}
                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dirección, Número de Casa, Entre Calles y Referencias
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="form-direccion"
                      value={formData.direccion || ''}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      placeholder="Ej. Cochise #66 entre Yaqui y Mayo (Frente al parque)"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Colonia */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Colonia / Sector
                  </label>
                  <input
                    type="text"
                    id="form-colonia"
                    value={formData.colonia || ''}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                    placeholder="Ej. EL APACHE"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all uppercase font-medium"
                  />
                </div>

                {/* Tipo de Inmueble / Casa */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo de Casa / Inmueble
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      id="form-tipoCasa"
                      value={formData.tipoCasa || '-'}
                      onChange={(e) => setFormData({ ...formData, tipoCasa: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all uppercase font-medium"
                    >
                      {TIPO_CASA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Teléfono Fijo */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teléfono Fijo
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="form-telefono"
                      value={formData.telefono || ''}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="Teléfono fijo"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Celular / WhatsApp */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Celular / WhatsApp
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="form-celular"
                      value={formData.celular || ''}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      placeholder="Ej. 6622111124"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Datos del Equipo y Falla Reportada */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Información del Equipo y Falla Reportada
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Aparato */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Aparato / Electrodoméstico
                  </label>
                  <select
                    id="form-aparato"
                    value={formData.aparato || 'REFRIGERADOR'}
                    onChange={(e) => setFormData({ ...formData, aparato: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-semibold uppercase"
                  >
                    {APARATO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Marca
                  </label>
                  <select
                    id="form-marca"
                    value={formData.marca || 'LG'}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-semibold uppercase"
                  >
                    {MARCA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modelo */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Modelo
                  </label>
                  <input
                    type="text"
                    id="form-modelo"
                    value={formData.modelo || ''}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ej. LS74BXP o WET4027HW0"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all uppercase font-medium"
                  />
                </div>

                {/* Serie Difusor */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Serie del Difusor
                  </label>
                  <input
                    type="text"
                    id="form-serieDifusor"
                    value={formData.serieDifusor || ''}
                    onChange={(e) => setFormData({ ...formData, serieDifusor: e.target.value })}
                    placeholder="Número de serie difusor o N/A"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-mono"
                  />
                </div>

                {/* Serie Equipo */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Serie del Equipo
                  </label>
                  <input
                    type="text"
                    id="form-serieEquipo"
                    value={formData.serieEquipo || ''}
                    onChange={(e) => setFormData({ ...formData, serieEquipo: e.target.value })}
                    placeholder="Ej. 003MRSS14470"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-mono font-medium"
                  />
                </div>

                {/* Falla Reportada */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Falla que Reporta el Cliente
                  </label>
                  <textarea
                    id="form-fallaReportada"
                    rows={2}
                    value={formData.fallaReportada || ''}
                    onChange={(e) => setFormData({ ...formData, fallaReportada: e.target.value })}
                    placeholder="Descripción detallada de la anomalía o falla reportada por el cliente..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Programación de Visita y Asignación Técnica */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Programación de Visita y Asignación Técnica
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Fecha de Visita */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fecha de Visita Programada
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      id="form-fechaVisita"
                      value={formData.fechaVisita || ''}
                      onChange={(e) => setFormData({ ...formData, fechaVisita: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Horario de Visita */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Horario de Visita
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      id="form-horaVisita"
                      value={formData.horaVisita || 'TRANSCURSO DEL DIA'}
                      onChange={(e) => setFormData({ ...formData, horaVisita: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-semibold uppercase"
                    >
                      {HORA_VISITA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Técnico Asignado */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Técnico en Sitio Asignado
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      id="form-tecnico"
                      value={formData.tecnico || 'JOAQUIN'}
                      onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-semibold uppercase"
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
            </div>

            {/* Sección 5: Bitácora de Visitas Técnicas en Domicilio */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Bitácora de Visitas Técnicas en Domicilio
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 1ra Visita */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detalles de 1ª Visita (Diagnóstico y Acciones Iniciales)
                  </label>
                  <textarea
                    id="form-detalles1erVisita"
                    rows={2}
                    value={formData.detalles1erVisita || ''}
                    onChange={(e) => setFormData({ ...formData, detalles1erVisita: e.target.value })}
                    placeholder="Diagnóstico, mediciones, piezas probadas y acciones realizadas en la 1ra visita..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all resize-y"
                  />
                </div>

                {/* 2da Visita */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detalles de 2ª Visita (Seguimiento / Refacciones)
                  </label>
                  <textarea
                    id="form-detalles2daVisita"
                    rows={2}
                    value={formData.detalles2daVisita || ''}
                    onChange={(e) => setFormData({ ...formData, detalles2daVisita: e.target.value })}
                    placeholder="Instalación de refacciones o seguimiento..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all resize-y"
                  />
                </div>

                {/* 3ra Visita */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detalles de 3ª Visita (Revisión Final y Pruebas)
                  </label>
                  <textarea
                    id="form-detalles3eraVisita"
                    rows={2}
                    value={formData.detalles3eraVisita || ''}
                    onChange={(e) => setFormData({ ...formData, detalles3eraVisita: e.target.value })}
                    placeholder="Pruebas finales, entrega o cierre..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Sección 6: Presupuesto, Partes y Requisición */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Presupuesto, Refacciones y Requisición
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Presupuesto */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Presupuesto Acordado / Total
                  </label>
                  <input
                    type="text"
                    id="form-presupuesto"
                    value={formData.presupuesto !== undefined ? String(formData.presupuesto) : ''}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    placeholder="Ej. $1,450.00"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-semibold"
                  />
                </div>

                {/* Partes Solicitadas */}
                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Partes Solicitadas / Refacciones
                  </label>
                  <input
                    type="text"
                    id="form-partesSolicitadas"
                    value={formData.partesSolicitadas || ''}
                    onChange={(e) => setFormData({ ...formData, partesSolicitadas: e.target.value })}
                    placeholder="Lista de piezas requeridas para la reparación"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-medium"
                  />
                </div>

                {/* # de Pedido */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    # de Pedido
                  </label>
                  <input
                    type="text"
                    id="form-numeroPedido"
                    value={formData.numeroPedido || ''}
                    onChange={(e) => setFormData({ ...formData, numeroPedido: e.target.value })}
                    placeholder="Requisición"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-mono"
                  />
                </div>

                {/* Número de Orden de Servicio */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Orden de Servicio
                  </label>
                  <input
                    type="text"
                    id="form-numeroOrdenServicio"
                    value={formData.numeroOrdenServicio || ''}
                    onChange={(e) => setFormData({ ...formData, numeroOrdenServicio: e.target.value })}
                    placeholder="No. Orden"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-mono"
                  />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Observaciones Generales
                  </label>
                  <input
                    type="text"
                    id="form-observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Ej. CLIENTE DEPOSITO $700.00 DE REVISION / Pendiente confirmación de horario"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Sección 7: Información Confidencial / Accesos y Referencias */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Información Confidencial / Accesos y Referencias
                  </h3>
                  <p className="text-[11px] text-emerald-700">
                    Notas privadas de acceso a caseta, portones y claves de seguridad.
                  </p>
                </div>
              </div>

              <textarea
                id="form-informacionConfidencial"
                rows={3}
                value={formData.informacionConfidencial || ''}
                onChange={(e) => setFormData({ ...formData, informacionConfidencial: e.target.value })}
                placeholder="Códigos de acceso, número de intercomunicador, autorización de caseta o indicaciones confidenciales para el técnico..."
                className="w-full p-3 text-sm bg-white border border-emerald-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-emerald-950 transition-all resize-y placeholder:text-emerald-400 font-medium"
              />
            </div>

            {/* Footer con Botones de Acción */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Botón Guardar */}
                <button
                  type="submit"
                  id="btn-guardar-reporte"
                  className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Actualizar Reporte' : 'Guardar Reporte'}</span>
                </button>

                {/* Botón Limpiar */}
                <button
                  type="button"
                  onClick={handleClearForm}
                  id="btn-limpiar-formulario"
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  title="Restablecer todos los campos en blanco"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">En Blanco</span>
                </button>
              </div>

              {/* Botones de acción si estamos editando */}
              {editingItem && (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <WhatsAppShareMenu
                    module="reporte_sitio"
                    record={editingItem}
                    company={company}
                    variant="button"
                  />
                  <button
                    type="button"
                    onClick={() => handleDuplicateRecord(editingItem)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                    title="Duplicar este reporte"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Duplicar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintSingle(editingItem)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                    title="Imprimir formato oficial"
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
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                    title="Exportar a PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-600" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(editingItem)}
                    className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Eliminar este reporte"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                </div>
              )}
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
                      <WhatsAppShareMenu
                        module="reporte_sitio"
                        record={item}
                        company={company}
                        variant="icon"
                      />
                      <button
                        type="button"
                        onClick={() => handlePrintSingle(item)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Imprimir formato"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const doc = ExportService.generateReporteSitioPdf(item, company);
                          doc.save(`Reporte_${item.numeroReporte}.pdf`);
                        }}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateRecord(item)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Duplicar reporte"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditRecord(item)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Editar reporte"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(item)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <WhatsAppShareMenu
                              module="reporte_sitio"
                              record={item}
                              company={company}
                              variant="icon"
                            />
                            <button
                              type="button"
                              onClick={() => handlePrintSingle(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Imprimir formato"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const doc = ExportService.generateReporteSitioPdf(item, company);
                                doc.save(`Reporte_${item.numeroReporte}.pdf`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Descargar PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateRecord(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Duplicar reporte"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditRecord(item)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Editar reporte"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar reporte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg font-mono font-bold text-xs">
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
                        <span className="font-bold text-rose-600">{item.celular || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aparato:</span>
                        <span className="font-semibold text-slate-700">
                          {item.aparato} ({item.marca})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Visita:</span>
                        <span className="font-semibold text-blue-700">{item.fechaVisita}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Técnico:</span>
                        <span className="font-bold text-slate-800">{item.tecnico}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1">
                      <WhatsAppShareMenu
                        module="reporte_sitio"
                        record={item}
                        company={company}
                        variant="icon"
                      />
                      <button
                        type="button"
                        onClick={() => handlePrintSingle(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Imprimir formato"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const doc = ExportService.generateReporteSitioPdf(item, company);
                          doc.save(`Reporte_${item.numeroReporte}.pdf`);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateRecord(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Duplicar reporte"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditRecord(item)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Editar reporte"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar reporte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
