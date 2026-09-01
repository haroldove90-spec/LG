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
  Calendar,
  Clock,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  User,
  Wrench,
  AlertTriangle,
  Lock,
  DollarSign,
  Package,
  Calculator,
  MessageCircle,
} from 'lucide-react';
import { OrdenTaller, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { printUnifiedDocumentDirectly } from '../lib/printUtils';
import { FormatPrintPreview } from './FormatPrintPreview';
import { WhatsAppShareMenu } from './WhatsAppShareMenu';
import { EvidencePhotoManager } from './EvidencePhotoManager';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  'CERRADO/ENTREGADO',
  'EN REPARACION',
  'EN DIAGNOSTICO',
  'ESPERANDO REFACCIONES',
  'ESPERANDO APROBACION',
  'LISTO PARA ENTREGA',
  'CANCELADO',
  'NUEVO',
];

const ATENDIO_OPTIONS = [
  'RAUL',
  'ELIZABETH',
  'MARIANA SILVA',
  'CARLOS MENDOZA',
  'JORGE ESTRADA',
  'DAVID RAMÍREZ',
  'ROBERTO VALENZUELA',
  'JOAQUIN',
];

const APARATO_OPTIONS = [
  'MICRO-ONDAS',
  'REFRIGERADOR',
  'LAVADORA',
  'SECADORA',
  'CENTRO DE LAVADO',
  'ESTUFA / PARRILLA',
  'PANTALLA SMART TV',
  'MINISPLIT / AIRE',
  'CONGELADOR',
  'LAVA-VAJILLAS',
  'ENFRIADOR DE AGUA',
  'CAVA DE VINOS',
];

const MARCA_OPTIONS = [
  'SAMSUNG',
  'LG',
  'WHIRLPOOL',
  'MABE',
  'GENERAL ELECTRIC',
  'MAYTAG',
  'PANASONIC',
  'FRIGIDAIRE',
  'DAEWOO / WINIA',
  'BOSCH',
  'ELECTROLUX',
  'HISENSE',
];

const TECNICO_OPTIONS = [
  'DAVID GONZALEZ',
  'ROBERTO VALENZUELA',
  'DAVID RAMÍREZ',
  'CARLOS MENDOZA',
  'JOAQUIN',
  'FERNANDO MORALES',
  'MIGUEL ÁNGEL TORRES',
];

const FALLA_PRESETS = [
  'AL CONECTARLO HACE UN RUIDO TIPO CORTO, REVISION GENERAL',
  'NO ENCIENDE NADA, REVISIÓN DE FUENTE / TARJETA',
  'NO CALIENTA / NO ENFRÍA, PROBABLE MAGNETRÓN O COMPRESOR',
  'TIRA AGUA POR DEBAJO / BOMBA DE DRENADO DAÑADA',
  'NO HACE CENTRIFUGADO, SE QUEDA TRABADO EL CICLO',
  'PANTALLA SIN IMAGEN CON AUDIO OK (LEDS / BACKLIGHT)',
  'HACE RUIDO EXCESIVO EN MOTOR O TRANSMISIÓN',
];

const ACCESORIOS_PRESETS = [
  'SE RECIBE SIN PLATO Y SIN ARO, Y SIN NINGUN OTRO ACCESORIO, VIENE UN POCO RAYADITO, CLIENTE PAGO REVISION $300.00',
  'SE RECIBE CON PLATO Y ARO ORIGINAL, GABINETE EN BUEN ESTADO',
  'CON CONTROL REMOTO ORIGINAL Y CABLE DE PODER',
  'GABINETE COMPLETO CON PARRILLAS INTERNAS, REVISIÓN PAGADA $400.00',
  'SE RECIBE ÚNICAMENTE UNIDAD PRINCIPAL SIN CABLES NI ACCESORIOS',
];

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const OrdenTallerModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [ordenes, setOrdenes] = useState<OrdenTaller[]>(() => StorageService.getOrdenesTaller());
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Form State
  const [currentRecordIndex, setCurrentRecordIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<OrdenTaller>>(() => {
    const list = StorageService.getOrdenesTaller();
    if (list.length > 0) return { ...list[0] };
    return {
      numeroOrdenTaller: StorageService.getNextOrdenTallerNumber(),
      estatus: 'CERRADO/ENTREGADO',
      fechaIngreso: new Date().toISOString().split('T')[0],
      atendio: 'RAUL',
      nombreCliente: '',
      direccion: '',
      colonia: '',
      telefono: '',
      celular: '',
      aparato: 'MICRO-ONDAS',
      marca: 'SAMSUNG',
      modeloCode: '',
      serie: '',
      falla: '',
      accesoriosObservaciones: '',
      tecnicoAsignado: 'DAVID GONZALEZ',
      presupuestoDesglose: '',
      subtotal: 0,
      iva: 0,
      presupuesto: 0,
      refacciones: '',
      numeroPedido: '',
      informacionConfidencial: '',
    };
  });

  // Directory Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'grid'>('cards');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [deleteCandidate, setDeleteCandidate] = useState<OrdenTaller | null>(null);
  const [printRecord, setPrintRecord] = useState<OrdenTaller | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Synchronize when records list changes
  const reloadData = () => {
    const fresh = StorageService.getOrdenesTaller();
    setOrdenes(fresh);
    return fresh;
  };

  const loadRecordByIndex = (idx: number, list = ordenes) => {
    if (list.length === 0) return;
    const safeIdx = Math.max(0, Math.min(idx, list.length - 1));
    setCurrentRecordIndex(safeIdx);
    setFormData({ ...list[safeIdx] });
  };

  // Navigations in form toolbar
  const handleNavFirst = () => loadRecordByIndex(0);
  const handleNavPrev = () => loadRecordByIndex(currentRecordIndex - 1);
  const handleNavNext = () => loadRecordByIndex(currentRecordIndex + 1);
  const handleNavLast = () => loadRecordByIndex(ordenes.length - 1);

  const handleNewRecord = () => {
    const nextNum = StorageService.getNextOrdenTallerNumber();
    const newRecord: Partial<OrdenTaller> = {
      numeroOrdenTaller: nextNum,
      estatus: 'EN DIAGNOSTICO',
      fechaIngreso: new Date().toISOString().split('T')[0],
      atendio: 'RAUL',
      nombreCliente: '',
      direccion: '',
      colonia: '',
      telefono: '',
      celular: '',
      aparato: 'MICRO-ONDAS',
      marca: 'SAMSUNG',
      modeloCode: '',
      serie: '',
      falla: '',
      accesoriosObservaciones: '',
      tecnicoAsignado: 'DAVID GONZALEZ',
      presupuestoDesglose: '',
      subtotal: 0,
      iva: 0,
      presupuesto: 0,
      refacciones: '',
      numeroPedido: '',
      informacionConfidencial: '',
    };
    setFormData(newRecord);
    setActiveTab('form');
    showNotification(`Nueva orden preparada con folio #${nextNum}`, 'info');
  };

  const handleClearForm = () => {
    const currentFolio = formData.numeroOrdenTaller || StorageService.getNextOrdenTallerNumber();
    setFormData({
      numeroOrdenTaller: currentFolio,
      estatus: 'EN DIAGNOSTICO',
      fechaIngreso: new Date().toISOString().split('T')[0],
      atendio: 'RAUL',
      nombreCliente: '',
      direccion: '',
      colonia: '',
      telefono: '',
      celular: '',
      aparato: 'MICRO-ONDAS',
      marca: 'SAMSUNG',
      modeloCode: '',
      serie: '',
      falla: '',
      accesoriosObservaciones: '',
      tecnicoAsignado: 'DAVID GONZALEZ',
      presupuestoDesglose: '',
      subtotal: 0,
      iva: 0,
      presupuesto: 0,
      refacciones: '',
      numeroPedido: '',
      informacionConfidencial: '',
    });
    showNotification('Formulario reiniciado para captura limpia', 'info');
  };

  const handleDuplicateRecord = (recToDuplicate?: OrdenTaller) => {
    const source = recToDuplicate || (formData as OrdenTaller);
    if (!source) return;
    const nextNum = StorageService.getNextOrdenTallerNumber();
    const cloned: Partial<OrdenTaller> = {
      ...source,
      id: undefined,
      numeroOrdenTaller: nextNum,
      fechaIngreso: new Date().toISOString().split('T')[0],
      nombreCliente: source.nombreCliente ? `${source.nombreCliente} (COPIA)` : '',
      estatus: 'EN DIAGNOSTICO',
    };
    setFormData(cloned);
    setActiveTab('form');
    showNotification(`Orden duplicada correctamente como folio #${nextNum}`, 'success');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.numeroOrdenTaller?.trim()) {
      showNotification('Ingrese el número de orden de taller.', 'error');
      return;
    }
    if (!formData.nombreCliente?.trim()) {
      showNotification('Ingrese el nombre del cliente.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const isEditing = !!formData.id;

    const recordToSave: OrdenTaller = {
      id: formData.id || `ot-${Date.now()}`,
      createdAt: formData.createdAt || now,
      updatedAt: now,
      numeroOrdenTaller: (formData.numeroOrdenTaller || '').trim(),
      estatus: (formData.estatus || 'EN DIAGNOSTICO').trim(),
      fechaIngreso: formData.fechaIngreso || now.split('T')[0],
      atendio: (formData.atendio || 'RAUL').trim(),
      nombreCliente: (formData.nombreCliente || '').trim().toUpperCase(),
      direccion: (formData.direccion || '').trim().toUpperCase(),
      colonia: (formData.colonia || '').trim().toUpperCase(),
      telefono: (formData.telefono || '').trim(),
      celular: (formData.celular || '').trim(),
      aparato: (formData.aparato || 'MICRO-ONDAS').trim().toUpperCase(),
      marca: (formData.marca || 'SAMSUNG').trim().toUpperCase(),
      modeloCode: (formData.modeloCode || '').trim().toUpperCase(),
      serie: (formData.serie || '').trim().toUpperCase(),
      falla: (formData.falla || '').trim().toUpperCase(),
      accesoriosObservaciones: (formData.accesoriosObservaciones || '').trim().toUpperCase(),
      tecnicoAsignado: (formData.tecnicoAsignado || 'DAVID GONZALEZ').trim().toUpperCase(),
      presupuestoDesglose: (formData.presupuestoDesglose || '').trim(),
      subtotal: Number(formData.subtotal) || 0,
      iva: Number(formData.iva) || 0,
      presupuesto: Number(formData.presupuesto) || 0,
      refacciones: (formData.refacciones || '').trim().toUpperCase(),
      numeroPedido: (formData.numeroPedido || '').trim().toUpperCase(),
      informacionConfidencial: (formData.informacionConfidencial || '').trim(),
    };

    const updatedList = StorageService.saveOrdenTaller(recordToSave);
    setOrdenes(updatedList);
    setFormData(recordToSave);

    const savedIndex = updatedList.findIndex((item) => item.id === recordToSave.id);
    if (savedIndex >= 0) setCurrentRecordIndex(savedIndex);

    showNotification(
      isEditing
        ? `Orden #${recordToSave.numeroOrdenTaller} actualizada exitosamente`
        : `Orden #${recordToSave.numeroOrdenTaller} guardada exitosamente`,
      'success'
    );
  };

  const requestDelete = (item: OrdenTaller) => {
    setDeleteCandidate(item);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const updated = StorageService.deleteOrdenTaller(deleteCandidate.id);
    setOrdenes(updated);
    setDeleteCandidate(null);
    showNotification(`Orden #${deleteCandidate.numeroOrdenTaller} eliminada correctamente.`, 'info');

    if (updated.length > 0) {
      loadRecordByIndex(Math.min(currentRecordIndex, updated.length - 1), updated);
    } else {
      handleNewRecord();
    }
  };

  // Print format handler (Direct printing)
  const openPrint = (item?: OrdenTaller) => {
    const target = item || (formData as OrdenTaller);
    if (!target || !target.nombreCliente) {
      showNotification('Guarde o seleccione una orden con nombre de cliente para imprimir su formato.', 'error');
      return;
    }
    printUnifiedDocumentDirectly('orden_taller', target, company);
  };

  const downloadPdf = (item?: OrdenTaller) => {
    const target = item || (formData as OrdenTaller);
    if (!target || !target.nombreCliente) {
      showNotification('Guarde o seleccione una orden para exportar su PDF.', 'error');
      return;
    }
    ExportService.exportToPdf('orden_taller', target);
    showNotification(`Descargando PDF de Orden #${target.numeroOrdenTaller}...`, 'success');
  };

  // Auto calculate subtotal & IVA helper
  const handleAutoCalculateIva = () => {
    const sub = Number(formData.subtotal) || 0;
    if (sub > 0) {
      const ivaCalc = +(sub * 0.16).toFixed(2);
      const totalCalc = +(sub + ivaCalc).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        iva: ivaCalc,
        presupuesto: totalCalc,
      }));
      showNotification(`IVA (16%) y Total calculados automáticamente: ${formatCurrency(totalCalc)}`, 'info');
    }
  };

  // Filtered Directory list
  const filteredOrdenes = useMemo(() => {
    return ordenes.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.numeroOrdenTaller || '').toLowerCase().includes(q) ||
        (item.nombreCliente || '').toLowerCase().includes(q) ||
        (item.aparato || '').toLowerCase().includes(q) ||
        (item.marca || '').toLowerCase().includes(q) ||
        (item.modeloCode || '').toLowerCase().includes(q) ||
        (item.serie || '').toLowerCase().includes(q) ||
        (item.falla || '').toLowerCase().includes(q) ||
        (item.tecnicoAsignado || '').toLowerCase().includes(q) ||
        (item.numeroPedido || '').toLowerCase().includes(q) ||
        (item.direccion || '').toLowerCase().includes(q) ||
        (item.colonia || '').toLowerCase().includes(q);

      // Status
      const matchesStatus =
        filterStatus === 'TODOS' ||
        (item.estatus || '').toUpperCase().includes(filterStatus.toUpperCase());

      // Date
      let matchesDate = true;
      const today = new Date().toISOString().split('T')[0];
      if (filterDate === 'today') {
        matchesDate = item.fechaIngreso === today;
      } else if (filterDate === 'yesterday') {
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        matchesDate = item.fechaIngreso === yDate.toISOString().split('T')[0];
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [ordenes, searchQuery, filterStatus, filterDate]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrdenes.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrdenes = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrdenes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrdenes, validCurrentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = ordenes.length;
    const cerrados = ordenes.filter((o) => (o.estatus || '').toUpperCase().includes('CERRADO') || (o.estatus || '').toUpperCase().includes('ENTREGADO')).length;
    const reparacion = ordenes.filter((o) => (o.estatus || '').toUpperCase().includes('REPARACION')).length;
    const diagnostico = ordenes.filter((o) => (o.estatus || '').toUpperCase().includes('DIAGNOSTICO')).length;
    const montoTotal = ordenes.reduce((acc, curr) => acc + (Number(curr.presupuesto) || 0), 0);
    return { total, cerrados, reparacion, diagnostico, montoTotal };
  }, [ordenes]);

  // Export full excel directory
  const exportFullExcel = () => {
    if (ordenes.length === 0) {
      showNotification('No hay órdenes para exportar.', 'error');
      return;
    }
    const rows = ordenes.map((o) => ({
      'Folio Orden': o.numeroOrdenTaller,
      'Estatus': o.estatus,
      'Fecha Ingreso': o.fechaIngreso,
      'Atendió': o.atendio,
      'Cliente': o.nombreCliente,
      'Dirección': o.direccion,
      'Colonia': o.colonia,
      'Teléfono': o.telefono,
      'Celular': o.celular,
      'Aparato': o.aparato,
      'Marca': o.marca,
      'Modelo Code': o.modeloCode,
      'Serie': o.serie,
      'Falla Reportada': o.falla,
      'Accesorios / Obs': o.accesoriosObservaciones,
      'Técnico Asignado': o.tecnicoAsignado,
      'Refacciones': o.refacciones,
      '# Pedido': o.numeroPedido,
      'Total Presupuesto': o.presupuesto,
      'Info Confidencial': o.informacionConfidencial,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Órdenes Taller');
    XLSX.writeFile(wb, `Ordenes_Taller_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Directorio de órdenes exportado a Excel correctamente.', 'success');
  };

  const getStatusBadgeStyle = (statusStr?: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s.includes('CERRADO') || s.includes('ENTREGADO')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('REPARACION')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('DIAGNOSTICO')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('ESPERANDO') || s.includes('REFACCION')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (s.includes('LISTO')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (s.includes('CANCELADO')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* NOTIFICACIÓN FLOTANTE */}
      {/* ========================================================================= */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border transition-all animate-in slide-in-from-top duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
              : notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
              : 'bg-slate-800 text-white border-slate-700 shadow-slate-900/20'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {notification.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {notification.type === 'info' && <Sparkles className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER DE MÓDULO & CONTROL DE VISTAS (DISEÑO LIMPIO Y UNIFICADO)          */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Módulo de Órdenes de Taller
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {ordenes.length} órdenes registradas
            </span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Sin Garantía
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>Órdenes de Taller & Servicio Especializado</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeTab === 'form'
              ? formData.numeroOrdenTaller
                ? `Editando orden #${formData.numeroOrdenTaller} (${formData.nombreCliente || 'Nuevo'})`
                : 'Formulario de captura para recepción de equipos, diagnóstico técnico y presupuesto desglosado.'
              : 'Directorio general, buscador instantáneo y administración de todas las órdenes de taller.'}
          </p>
        </div>

        {/* Botonera de Navegación de Vistas y Búsqueda */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'form' ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="btn-ir-a-directorio-ordenes"
              className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer border border-slate-800"
              title="Ir al directorio general de órdenes"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Buscador de Órdenes / Directorio</span>
              <span className="bg-slate-800 text-blue-300 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ml-1">
                {ordenes.length}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNewRecord}
              id="btn-ir-a-nueva-orden"
              className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Abrir formulario de captura para una nueva orden"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nueva Orden</span>
            </button>
          )}

          {/* Exportación a Excel */}
          <button
            type="button"
            onClick={exportFullExcel}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Exportar órdenes a archivo Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* MÉTRICAS COMPACTAS Y LIMPIAS */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-slate-400 font-medium mr-1.5">Total:</span>
            <span className="font-bold text-slate-900 font-mono">{stats.total}</span>
          </div>
          <div className="hidden sm:block w-px h-3.5 bg-slate-200" />
          <div>
            <span className="text-amber-600 font-medium mr-1.5">Diagnóstico:</span>
            <span className="font-bold text-slate-900 font-mono">{stats.diagnostico}</span>
          </div>
          <div className="hidden sm:block w-px h-3.5 bg-slate-200" />
          <div>
            <span className="text-blue-600 font-medium mr-1.5">Reparación:</span>
            <span className="font-bold text-slate-900 font-mono">{stats.reparacion}</span>
          </div>
          <div className="hidden sm:block w-px h-3.5 bg-slate-200" />
          <div>
            <span className="text-emerald-600 font-medium mr-1.5">Cerradas:</span>
            <span className="font-bold text-slate-900 font-mono">{stats.cerrados}</span>
          </div>
        </div>
        <div className="text-right font-medium">
          <span className="text-slate-400 mr-1.5">Presupuesto:</span>
          <span className="font-bold text-blue-700 font-mono">{formatCurrency(stats.montoTotal)}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: FORMULARIO DE CAPTURA CON BARRA DE NAVEGACIÓN */}
      {/* ========================================================================= */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-150">
          {/* Form Banner Header (Dark card with colored icon box matching Cotizaciones & Citas) */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  {formData.id ? 'Editar Orden de Taller (Sin Garantía)' : 'Registrar Nueva Orden de Taller'}
                </h2>
                <p className="text-xs text-slate-400">
                  {formData.id
                    ? 'Modifica los datos de recepción, diagnóstico, presupuesto y estatus.'
                    : 'Captura los datos del cliente, equipo, falla reportada y presupuesto inicial.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {/* Controles de Navegación Compactos entre Registros */}
              <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={handleNavFirst}
                  disabled={ordenes.length === 0 || currentRecordIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Primera orden"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNavPrev}
                  disabled={ordenes.length === 0 || currentRecordIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Orden anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNewRecord}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Limpiar para nueva orden"
                >
                  Nueva
                </button>
                <button
                  type="button"
                  onClick={handleNavNext}
                  disabled={ordenes.length === 0 || currentRecordIndex >= ordenes.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Siguiente orden"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNavLast}
                  disabled={ordenes.length === 0 || currentRecordIndex >= ordenes.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Última orden"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 font-medium">Asignación #:</span>
                <span className="font-mono font-black text-blue-400">#{formData.numeroOrdenTaller || 'N/A'}</span>
              </div>

              {formData.id && (
                <button
                  type="button"
                  onClick={handleNewRecord}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1.5 bg-amber-950/40 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Toolbar de Acciones del Formulario */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                {currentRecordIndex >= 0 && ordenes.length > 0
                  ? `Orden ${currentRecordIndex + 1} de ${ordenes.length}`
                  : 'Nueva Orden'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <WhatsAppShareMenu
                module="orden_taller"
                record={formData}
                company={company}
                variant="button"
              />

              <button
                type="button"
                onClick={handleNewRecord}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Limpiar formulario para nueva orden"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>En Blanco (Nueva)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateRecord()}
                disabled={!formData.nombreCliente}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Duplicar datos en nueva orden"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Duplicar</span>
              </button>

              <button
                type="button"
                onClick={() => openPrint()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Imprimir directamente formato de orden"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => downloadPdf()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Descargar PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF</span>
              </button>

              {formData.id && (
                <button
                  type="button"
                  onClick={() => {
                    const rec = ordenes.find((o) => o.id === formData.id);
                    if (rec) requestDelete(rec);
                  }}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  title="Eliminar orden actual"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer ml-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Orden</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CUERPO DEL FORMULARIO ESTRUCTURADO */}
          {/* ===================================================================== */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* SECCIÓN 1: ENCABEZADO Y CONTROL DE ORDEN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Control y Folio de Taller
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {formData.id ? 'Modificando Registro Existente' : 'Nuevo Registro'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ORDEN TALLER / FOLIO */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Orden Taller (Folio) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.numeroOrdenTaller || ''}
                      onChange={(e) => setFormData({ ...formData, numeroOrdenTaller: e.target.value })}
                      placeholder="Ej. 5259"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* STATUS DE ORDEN */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status de Orden <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.estatus || 'EN DIAGNOSTICO'}
                    onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FECHA DE INGRESO */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Ingreso <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={formData.fechaIngreso || ''}
                      onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* ATENDIÓ */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Atendió / Receptor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="atendio-list"
                    value={formData.atendio || ''}
                    onChange={(e) => setFormData({ ...formData, atendio: e.target.value.toUpperCase() })}
                    placeholder="Ej. RAUL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                  <datalist id="atendio-list">
                    {ATENDIO_OPTIONS.map((at) => (
                      <option key={at} value={at} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL CLIENTE Y UBICACIÓN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Datos del Cliente y Ubicación
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* NOMBRE DEL CLIENTE */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Cliente <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.nombreCliente || ''}
                      onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value.toUpperCase() })}
                      placeholder="Ej. OT5259 RAMIRO RIVERA"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* DIRECCIÓN */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dirección (Calle y Número)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.direccion || ''}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value.toUpperCase() })}
                      placeholder="Ej. SATURDINO CAMPOY #602"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* COLONIA */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Colonia
                  </label>
                  <input
                    type="text"
                    value={formData.colonia || ''}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value.toUpperCase() })}
                    placeholder="Ej. JESUS GARCIA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                </div>

                {/* TELÉFONO FIJO */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono Fijo
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={formData.telefono || ''}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="Ej. 6622145500"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* CELULAR / WHATSAPP */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Celular (WhatsApp)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={formData.celular || ''}
                        onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                        placeholder="Ej. 6622111124"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                      />
                    </div>
                    {formData.celular && (
                      <a
                        href={`https://wa.me/52${formData.celular.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                        title="Abrir chat en WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: DATOS DEL APARATO */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Datos del Aparato y Equipo
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* APARATO */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Aparato <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="aparato-list"
                    required
                    value={formData.aparato || ''}
                    onChange={(e) => setFormData({ ...formData, aparato: e.target.value.toUpperCase() })}
                    placeholder="Ej. MICRO-ONDAS"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                  <datalist id="aparato-list">
                    {APARATO_OPTIONS.map((ap) => (
                      <option key={ap} value={ap} />
                    ))}
                  </datalist>
                </div>

                {/* MARCA */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marca <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="marca-list"
                    required
                    value={formData.marca || ''}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value.toUpperCase() })}
                    placeholder="Ej. SAMSUNG"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                  <datalist id="marca-list">
                    {MARCA_OPTIONS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                {/* MODELO CODE / VERSIÓN */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Modelo Code / Versión
                  </label>
                  <input
                    type="text"
                    value={formData.modeloCode || ''}
                    onChange={(e) => setFormData({ ...formData, modeloCode: e.target.value.toUpperCase() })}
                    placeholder="Ej. MG40J5133AT/AX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                </div>

                {/* NÚMERO DE SERIE */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    value={formData.serie || ''}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value.toUpperCase() })}
                    placeholder="Ej. 0AG37WDJ904596J"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: RECEPCIÓN, FALLA, ACCESORIOS Y TÉCNICO */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                    4
                  </span>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Recepción, Diagnóstico y Asignación
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                {/* FALLA */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Falla Reportada por el Cliente <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Presets rápidos de falla:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {FALLA_PRESETS.slice(0, 3).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormData({ ...formData, falla: f })}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium transition-colors text-left truncate max-w-[280px]"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={formData.falla || ''}
                    onChange={(e) => setFormData({ ...formData, falla: e.target.value.toUpperCase() })}
                    placeholder="Ej. AL CONECTARLO HACE UN RUIDO TIPO CORTO, REVISION GENERAL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                </div>

                {/* ACCESORIOS / OBSERVACIONES */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Accesorios / Observaciones de Entrada
                    </label>
                    <span className="text-[10px] text-slate-400">Presets rápidos:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ACCESORIOS_PRESETS.slice(0, 2).map((acc) => (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => setFormData({ ...formData, accesoriosObservaciones: acc })}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium transition-colors text-left truncate max-w-[320px]"
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={formData.accesoriosObservaciones || ''}
                    onChange={(e) => setFormData({ ...formData, accesoriosObservaciones: e.target.value.toUpperCase() })}
                    placeholder="Ej. SE RECIBE SIN PLATO Y SIN ARO, Y SIN NINGUN OTRO ACCESORIO, VIENE UN POCO RAYADITO, CLIENTE PAGO REVISION $300.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* TÉCNICO ASIGNADO */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Técnico Asignado
                    </label>
                    <input
                      type="text"
                      list="tecnico-list"
                      value={formData.tecnicoAsignado || ''}
                      onChange={(e) => setFormData({ ...formData, tecnicoAsignado: e.target.value.toUpperCase() })}
                      placeholder="Ej. DAVID GONZALEZ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                    <datalist id="tecnico-list">
                      {TECNICO_OPTIONS.map((tc) => (
                        <option key={tc} value={tc} />
                      ))}
                    </datalist>
                  </div>

                  {/* # DE PEDIDO */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      # de Pedido / Requisición
                    </label>
                    <input
                      type="text"
                      value={formData.numeroPedido || ''}
                      onChange={(e) => setFormData({ ...formData, numeroPedido: e.target.value.toUpperCase() })}
                      placeholder="Ej. PED-5259-SAMS"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: PRESUPUESTO DESGLOSADO Y REFACCIONES */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                    5
                  </span>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Presupuesto, Desglose y Refacciones
                  </h3>
                </div>
                <span className="text-xs font-bold text-blue-700">
                  Total: {formatCurrency(formData.presupuesto)}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* DESGLOSE EN TEXTO (COMO EN EL SISTEMA ORIGINAL) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Desglose Completo de Presupuesto (Mano de Obra + Partes)
                  </label>
                  <textarea
                    rows={5}
                    value={formData.presupuestoDesglose || ''}
                    onChange={(e) => setFormData({ ...formData, presupuestoDesglose: e.target.value })}
                    placeholder={'REPARACION DE TARJETA ( CAMBIO DE IC, REGULADOR Y FILTROS ) Y MICA PROTECTORA $525.00\nMANO DE OBRA $350.00\nSUBTOTAL $875.00\nIVA $140.00\nTOTAL $1,015.00 PASAR $$$'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors leading-relaxed"
                  />
                </div>

                {/* CÁLCULO NUMÉRICO DIRECTO */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cálculo Rápido</span>
                    <button
                      type="button"
                      onClick={handleAutoCalculateIva}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Calcular IVA (16%)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Subtotal
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.subtotal || ''}
                        onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        IVA (16%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.iva || ''}
                        onChange={(e) => setFormData({ ...formData, iva: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                        Total Final
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.presupuesto || ''}
                        onChange={(e) => setFormData({ ...formData, presupuesto: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono font-black text-blue-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Refacciones Requeridas
                    </label>
                    <input
                      type="text"
                      value={formData.refacciones || ''}
                      onChange={(e) => setFormData({ ...formData, refacciones: e.target.value.toUpperCase() })}
                      placeholder="Ej. IC, REGULADOR, FILTROS Y MICA PROTECTORA"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: INFORMACIÓN CONFIDENCIAL / NOTAS INTERNAS */}
            <div className="bg-amber-50/50 rounded-2xl p-5 sm:p-6 border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Información Confidencial / Notas Internas de Taller
                </h3>
              </div>
              <textarea
                rows={3}
                value={formData.informacionConfidencial || ''}
                onChange={(e) => setFormData({ ...formData, informacionConfidencial: e.target.value })}
                placeholder={'EQUIPO LISTO. Buen día se le cambió el filtro Ay se lo mostré en la foto y servicio OK SE LE ENVIO PRESUPUESTO 25/09/2025 +++++ LISTO PROBADO Y ENTREGADO SIN ORDEN 26/09/2025 09:39:35 a. m.'}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition-colors"
              />
            </div>

            {/* SECCIÓN 7: EVIDENCIAS FOTOGRÁFICAS (CÁMARA / GALERÍA) */}
            <EvidencePhotoManager
              photos={formData.evidencias || []}
              onChange={(photos) => setFormData({ ...formData, evidencias: photos })}
              title="Evidencias Fotográficas del Equipo y Taller"
              subtitle="Captura fotos con la cámara de tu celular o sube imágenes del estado de entrada, placas de serie y reparaciones"
            />

            {/* BOTÓN INFERIOR DE GUARDAR */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{formData.id ? 'Actualizar Orden de Taller' : 'Guardar Nueva Orden'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: DIRECTORIO DE ÓRDENES (LISTADO COMPLETO) */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por Folio, Cliente, Aparato, Marca, Modelo, Serie, Técnico o Falla..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista de Fichas"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista de Tabla Compacta"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista de Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* STATUS FILTER CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['TODOS', ...STATUS_OPTIONS].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setFilterStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* LIST CONTAINER */}
          {paginatedOrdenes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No se encontraron órdenes de taller</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Intente ajustar los filtros de búsqueda o registre una nueva orden utilizando el botón de captura.
              </p>
              <button
                type="button"
                onClick={handleNewRecord}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer mt-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Crear Nueva Orden</span>
              </button>
            </div>
          ) : (
            <>
              {/* VISTA 1: CARDS DETALLADAS */}
              {viewMode === 'cards' && (
                <div className="space-y-3">
                  {paginatedOrdenes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-black text-sm border border-blue-100">
                            #{item.numeroOrdenTaller}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-black text-slate-900">{item.nombreCliente}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(item.estatus)}`}>
                                {item.estatus}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span><strong>Ingreso:</strong> {item.fechaIngreso}</span>
                              <span>•</span>
                              <span><strong>Atendió:</strong> {item.atendio}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-bold"><strong>Téc:</strong> {item.tecnicoAsignado || 'Por asignar'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Presupuesto Big Box */}
                        <div className="text-right sm:self-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Presupuesto
                          </span>
                          <span className="text-base font-black text-blue-700 font-mono">
                            {formatCurrency(item.presupuesto)}
                          </span>
                        </div>
                      </div>

                      {/* Card Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold text-[10px] uppercase">Aparato y Marca</span>
                          <span className="font-bold text-slate-800">{item.aparato} • {item.marca}</span>
                          <span className="text-slate-500 block font-mono text-[11px]">Mod: {item.modeloCode || 'N/A'} | S/N: {item.serie || 'N/A'}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold text-[10px] uppercase">Ubicación y Contacto</span>
                          <span className="text-slate-700 truncate block">{item.direccion || 'Sin dirección'}</span>
                          <span className="text-slate-500 block">{item.colonia || 'Sin colonia'} | Tel: {item.telefono || ''} {item.celular ? `/ Cel: ${item.celular}` : ''}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2 lg:col-span-1">
                          <span className="text-slate-400 block font-bold text-[10px] uppercase">Falla y Observaciones</span>
                          <p className="text-slate-700 truncate">{item.falla}</p>
                          <p className="text-slate-500 text-[11px] truncate">{item.accesoriosObservaciones || 'Sin accesorios'}</p>
                        </div>
                      </div>

                      {/* ACTION BUTTON BAR (UNIFIED DESIGN) */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1">
                          <WhatsAppShareMenu
                            module="orden_taller"
                            record={item}
                            company={company}
                            variant="icon"
                          />
                          <button
                            type="button"
                            onClick={() => openPrint(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Imprimir formato de orden"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPdf(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Descargar PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateRecord(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplicar orden"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const idx = ordenes.findIndex((o) => o.id === item.id);
                              loadRecordByIndex(idx >= 0 ? idx : 0);
                              setActiveTab('form');
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Editar orden"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar orden"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VISTA 2: TABLA COMPACTA */}
              {viewMode === 'table' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Folio</th>
                          <th className="py-3 px-4">Estatus</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Cliente</th>
                          <th className="py-3 px-4">Aparato / Marca</th>
                          <th className="py-3 px-4">Técnico</th>
                          <th className="py-3 px-4 text-right">Presupuesto</th>
                          <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {paginatedOrdenes.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-bold text-blue-700">#{item.numeroOrdenTaller}</td>
                            <td className="py-2.5 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(item.estatus)}`}>
                                {item.estatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">{item.fechaIngreso}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{item.nombreCliente}</td>
                            <td className="py-2.5 px-4 text-slate-700">{item.aparato} • {item.marca}</td>
                            <td className="py-2.5 px-4 text-slate-600">{item.tecnicoAsignado || 'Sin asignar'}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-700">
                              {formatCurrency(item.presupuesto)}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <WhatsAppShareMenu
                                  module="orden_taller"
                                  record={item}
                                  company={company}
                                  variant="icon"
                                />
                                <button
                                  type="button"
                                  onClick={() => openPrint(item)}
                                  className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                                  title="Imprimir"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadPdf(item)}
                                  className="p-1 text-slate-500 hover:text-rose-600 rounded cursor-pointer"
                                  title="PDF"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const idx = ordenes.findIndex((o) => o.id === item.id);
                                    loadRecordByIndex(idx >= 0 ? idx : 0);
                                    setActiveTab('form');
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer font-bold"
                                  title="Editar"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestDelete(item)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                  title="Eliminar"
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

              {/* VISTA 3: GRID CUADRÍCULA */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedOrdenes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-mono font-black text-sm text-blue-700">#{item.numeroOrdenTaller}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(item.estatus)}`}>
                            {item.estatus}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mt-2 truncate">{item.nombreCliente}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{item.aparato} • {item.marca}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">Mod: {item.modeloCode || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.falla}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                          <span className="text-2xs text-slate-400">{item.fechaIngreso}</span>
                          <span className="text-sm font-black text-blue-700 font-mono">
                            {formatCurrency(item.presupuesto)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1">
                            <WhatsAppShareMenu
                              module="orden_taller"
                              record={item}
                              company={company}
                              variant="icon"
                            />
                            <button
                              type="button"
                              onClick={() => openPrint(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Imprimir formato"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadPdf(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Descargar PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateRecord(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Duplicar orden"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const idx = ordenes.findIndex((o) => o.id === item.id);
                                loadRecordByIndex(idx >= 0 ? idx : 0);
                                setActiveTab('form');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Editar orden"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar orden"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
                  <span>
                    Mostrando {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                    {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredOrdenes.length)} de{' '}
                    {filteredOrdenes.length} órdenes de taller
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={validCurrentPage === 1}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Primera página"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validCurrentPage === 1}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 font-semibold text-slate-800">
                      {validCurrentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={validCurrentPage === totalPages}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Página siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={validCurrentPage === totalPages}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Última página"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
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
                ¿Eliminar orden de taller #{deleteCandidate.numeroOrdenTaller}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción eliminará el registro de <strong>{deleteCandidate.nombreCliente}</strong>{' '}
                permanentemente de la base de datos local.
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

      {/* ========================================================================= */}
      {/* MODAL DE IMPRESIÓN FORMAL Y MINIMALISTA */}
      {/* ========================================================================= */}
      {isPrintModalOpen && printRecord && (
        <FormatPrintPreview
          module="orden_taller"
          record={printRecord}
          company={company}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
