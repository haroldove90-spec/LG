import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Printer,
  FileDown,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  FileSpreadsheet,
  X,
  Phone,
  Smartphone,
  Mail,
  Calendar,
  User,
  Wrench,
  ShieldAlert,
  Lock,
  DollarSign,
  Package,
  Layers,
  Calculator,
  LayoutGrid,
  List,
  Grid,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Tag,
  Truck,
  Hash,
  FileCheck,
} from 'lucide-react';
import { Cotizacion, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { FormatPrintPreview } from './FormatPrintPreview';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 10;

const STATUS_COTIZACION_OPTIONS = [
  'DEPOSITO EL TOTAL',
  'ANTICIPO 50%',
  'ANTICIPO 70%',
  'ANTICIPO',
  'COTIZADO / ENVIADO',
  'PENDIENTE DE PAGO',
  'PENDIENTE',
  'AUTORIZADO',
  'PEDIDO EN PLANTA / PROVEEDOR',
  'EN TRANSITO / PAQUETERIA',
  'RECIBIDO EN TALLER',
  'ENTREGADO / CERRADO',
  'CANCELADO',
  'GARANTIA',
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
  'FERNANDO MORALES',
];

const APARATO_OPTIONS = [
  'REFRIGERADOR',
  'LAVADORA',
  'SECADORA',
  'CENTRO DE LAVADO',
  'MINISPLIT / CLIMA',
  'ESTUFA / PARRILLA',
  'HORNO DE MICROONDAS',
  'LAVA-VAJILLAS',
  'PANTALLA SMART TV',
  'CONGELADOR',
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

const FIXED_POLICY_NOTE = 'En piezas eléctricas no hay devolución, ni garantía';

const formatCurrency = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '$0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
};

export const CotizacionModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(() =>
    StorageService.getCotizaciones()
  );
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'grid'>('cards');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState<Partial<Cotizacion>>(() => {
    const list = StorageService.getCotizaciones();
    if (list.length > 0) {
      return { ...list[0] };
    }
    return {
      numeroCotizacion: StorageService.getNextCotizacionNumber(),
      referenciaRef: '',
      estatus: 'DEPOSITO EL TOTAL',
      fechaPedido: new Date().toISOString().split('T')[0],
      atendio: 'RAUL',
      nombreCliente: '',
      telefono: '',
      celular: '',
      email: '',
      aparato: 'REFRIGERADOR',
      marca: 'SAMSUNG',
      modelo: '',
      serie: '',
      nombreNumeroParte: '',
      notaPolitica: FIXED_POLICY_NOTE,
      detallesOperacion: '',
      subtotal: 0,
      iva: 0,
      costoRefaccion: 0,
      datosPedido: '',
      informacionConfidencial: '',
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printRecord, setPrintRecord] = useState<Cotizacion | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Cotizacion | null>(null);

  // Directory / Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [aparatoFilter, setAparatoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load record at currentIndex when browsing
  const loadRecordByIndex = (idx: number) => {
    if (idx >= 0 && idx < cotizaciones.length) {
      setCurrentIndex(idx);
      setFormData({ ...cotizaciones[idx] });
    }
  };

  // Prepare a blank new record
  const handleNewRecord = () => {
    const nextNo = StorageService.getNextCotizacionNumber();
    const blank: Partial<Cotizacion> = {
      id: undefined,
      numeroCotizacion: nextNo,
      referenciaRef: '',
      estatus: 'DEPOSITO EL TOTAL',
      fechaPedido: new Date().toISOString().split('T')[0],
      atendio: 'RAUL',
      nombreCliente: '',
      telefono: '',
      celular: '',
      email: '',
      aparato: 'REFRIGERADOR',
      marca: 'SAMSUNG',
      modelo: '',
      serie: '',
      nombreNumeroParte: '',
      notaPolitica: FIXED_POLICY_NOTE,
      detallesOperacion: '',
      subtotal: 0,
      iva: 0,
      costoRefaccion: 0,
      datosPedido: '',
      informacionConfidencial: '',
    };
    setFormData(blank);
    setCurrentIndex(-1);
    setActiveTab('form');
    setToastMessage(`Formulario limpio listo para nueva Cotización #${nextNo}`);
  };

  // Duplicate current record in form
  const handleDuplicate = () => {
    const nextNo = StorageService.getNextCotizacionNumber();
    const duplicated: Partial<Cotizacion> = {
      ...formData,
      id: undefined,
      numeroCotizacion: nextNo,
      referenciaRef: formData.referenciaRef ? `${formData.referenciaRef}-COPIA` : '',
      nombreCliente: formData.nombreCliente ? `${formData.nombreCliente} (Copia)` : '',
      fechaPedido: new Date().toISOString().split('T')[0],
      createdAt: undefined,
      updatedAt: undefined,
    };
    setFormData(duplicated);
    setCurrentIndex(-1);
    setActiveTab('form');
    setToastMessage(`Cotización duplicada con nuevo No. #${nextNo}`);
  };

  // Duplicate record directly from directory
  const handleDuplicateRecord = (item: Cotizacion) => {
    const nextNo = StorageService.getNextCotizacionNumber();
    const duplicated: Cotizacion = {
      ...item,
      id: `cot-${Date.now()}`,
      numeroCotizacion: nextNo,
      referenciaRef: item.referenciaRef ? `${item.referenciaRef}-COPIA` : '',
      nombreCliente: item.nombreCliente ? `${item.nombreCliente} (Copia)` : '',
      fechaPedido: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = StorageService.saveCotizacion(duplicated);
    setCotizaciones(updated);
    setFormData(duplicated);
    setCurrentIndex(0);
    setToastMessage(`Cotización duplicada con nuevo No. #${nextNo}`);
  };

  // Auto calculate IVA 16%
  const handleCalculateIVA = () => {
    const sub = Number(formData.subtotal || 0);
    const calculatedIVA = Math.round(sub * 0.16 * 100) / 100;
    const total = Math.round((sub + calculatedIVA) * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      iva: calculatedIVA,
      costoRefaccion: total,
    }));
    setToastMessage(`IVA 16% calculado: $${calculatedIVA.toFixed(2)} | Total: $${total.toFixed(2)}`);
  };

  // Set No IVA
  const handleZeroIVA = () => {
    const sub = Number(formData.subtotal || 0);
    setFormData((prev) => ({
      ...prev,
      iva: 0,
      costoRefaccion: sub,
    }));
    setToastMessage(`IVA establecido en $0.00 | Total: $${sub.toFixed(2)}`);
  };

  // Recalculate total when subtotal changes
  const handleSubtotalChange = (val: number) => {
    const currentIVA = Number(formData.iva || 0);
    setFormData((prev) => ({
      ...prev,
      subtotal: val,
      costoRefaccion: val + currentIVA,
    }));
  };

  // Recalculate total when IVA changes
  const handleIVAChange = (val: number) => {
    const currentSub = Number(formData.subtotal || 0);
    setFormData((prev) => ({
      ...prev,
      iva: val,
      costoRefaccion: currentSub + val,
    }));
  };

  // Save record
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.nombreCliente?.trim()) {
      alert('Por favor ingrese el Nombre del Cliente');
      return;
    }
    if (!formData.modelo?.trim()) {
      alert('El campo Modelo es obligatorio');
      return;
    }

    const isEditing = Boolean(formData.id);
    const cotizacionId = formData.id || `cot-${Date.now()}`;
    const nextNo = formData.numeroCotizacion?.trim() || StorageService.getNextCotizacionNumber();

    const cotizacionToSave: Cotizacion = {
      id: cotizacionId,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      numeroCotizacion: nextNo,
      referenciaRef: formData.referenciaRef || '',
      estatus: formData.estatus || 'DEPOSITO EL TOTAL',
      fechaPedido: formData.fechaPedido || new Date().toISOString().split('T')[0],
      atendio: formData.atendio || 'RAUL',
      nombreCliente: formData.nombreCliente.trim(),
      telefono: formData.telefono || '',
      celular: formData.celular || '',
      email: formData.email || '',
      aparato: formData.aparato || 'REFRIGERADOR',
      marca: formData.marca || 'SAMSUNG',
      modelo: formData.modelo.trim(),
      serie: formData.serie || '',
      nombreNumeroParte: formData.nombreNumeroParte || '',
      notaPolitica: FIXED_POLICY_NOTE,
      detallesOperacion: formData.detallesOperacion || '',
      subtotal: Number(formData.subtotal || 0),
      iva: Number(formData.iva || 0),
      costoRefaccion: Number(formData.costoRefaccion || 0),
      datosPedido: formData.datosPedido || '',
      informacionConfidencial: formData.informacionConfidencial || '',
    };

    const updatedList = StorageService.saveCotizacion(cotizacionToSave);
    setCotizaciones(updatedList);
    setFormData(cotizacionToSave);

    const savedIndex = updatedList.findIndex((c) => c.id === cotizacionToSave.id);
    setCurrentIndex(savedIndex >= 0 ? savedIndex : 0);

    setToastMessage(
      isEditing
        ? `Cotización #${nextNo} actualizada correctamente`
        : `Cotización #${nextNo} registrada exitosamente`
    );
  };

  // Open Delete confirmation
  const requestDelete = (record: Cotizacion) => {
    setDeleteCandidate(record);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const updated = StorageService.deleteCotizacion(deleteCandidate.id);
    setCotizaciones(updated);
    setDeleteCandidate(null);
    setToastMessage(`Cotización #${deleteCandidate.numeroCotizacion} eliminada`);

    if (updated.length > 0) {
      const nextIdx = Math.min(currentIndex, updated.length - 1);
      setCurrentIndex(nextIdx);
      setFormData({ ...updated[nextIdx] });
    } else {
      handleNewRecord();
    }
  };

  // Open print modal
  const openPrint = (item: Cotizacion) => {
    setPrintRecord(item);
    setIsPrintModalOpen(true);
  };

  // Direct PDF Download
  const downloadPdf = (item: Cotizacion) => {
    const doc = ExportService.generateCotizacionPdf(item, company);
    doc.save(`Cotizacion_${item.numeroCotizacion || item.id}.pdf`);
  };

  // Filter logic
  const filteredCotizaciones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return cotizaciones.filter((item) => {
      // 1. Check numeric exact search if query is purely numeric (e.g. "8292", "2")
      const isPureNumber = /^\d+$/.test(q);
      let matchesSearch = true;

      if (q) {
        if (isPureNumber) {
          const itemNum = (item.numeroCotizacion || '').replace(/[^0-9]/g, '');
          const idNum = (item.id || '').replace(/[^0-9]/g, '');
          const refNum = (item.referenciaRef || '').replace(/[^0-9]/g, '');
          const celNum = (item.celular || '').replace(/[^0-9]/g, '');

          const exactNoMatch = itemNum === q || item.numeroCotizacion?.toLowerCase() === q;
          const exactIdMatch = idNum === q || item.id?.toLowerCase() === q;
          const exactRefMatch = refNum === q || item.referenciaRef?.toLowerCase() === q;
          const containsCel = celNum.includes(q);
          const containsText =
            item.nombreCliente.toLowerCase().includes(q) ||
            item.modelo.toLowerCase().includes(q) ||
            item.nombreNumeroParte.toLowerCase().includes(q);

          matchesSearch = exactNoMatch || exactIdMatch || exactRefMatch || containsCel || containsText;
        } else {
          // General text search
          matchesSearch =
            item.numeroCotizacion.toLowerCase().includes(q) ||
            (item.referenciaRef || '').toLowerCase().includes(q) ||
            item.nombreCliente.toLowerCase().includes(q) ||
            item.aparato.toLowerCase().includes(q) ||
            item.marca.toLowerCase().includes(q) ||
            item.modelo.toLowerCase().includes(q) ||
            (item.serie || '').toLowerCase().includes(q) ||
            (item.celular || '').toLowerCase().includes(q) ||
            (item.atendio || '').toLowerCase().includes(q) ||
            (item.nombreNumeroParte || '').toLowerCase().includes(q) ||
            (item.detallesOperacion || '').toLowerCase().includes(q) ||
            (item.datosPedido || '').toLowerCase().includes(q);
        }
      }

      const matchesStatus = statusFilter === 'all' || item.estatus === statusFilter;
      const matchesBrand =
        brandFilter === 'all' || item.marca?.toLowerCase() === brandFilter.toLowerCase();
      const matchesAparato =
        aparatoFilter === 'all' || item.aparato?.toLowerCase() === aparatoFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesBrand && matchesAparato;
    });
  }, [cotizaciones, searchQuery, statusFilter, brandFilter, aparatoFilter]);

  // Financial summary metrics
  const summaryMetrics = useMemo(() => {
    const totalCount = cotizaciones.length;
    const totalAmount = cotizaciones.reduce((acc, c) => acc + (c.costoRefaccion || 0), 0);
    const depositadosCount = cotizaciones.filter(
      (c) =>
        c.estatus.includes('DEPOSITO') ||
        c.estatus.includes('ANTICIPO') ||
        c.estatus.includes('AUTORIZADO')
    ).length;
    const pendientesCount = cotizaciones.filter(
      (c) =>
        c.estatus.includes('PENDIENTE') ||
        c.estatus.includes('COTIZADO') ||
        c.estatus.includes('NUEVO')
    ).length;

    return { totalCount, totalAmount, depositadosCount, pendientesCount };
  }, [cotizaciones]);

  // Export directory to Excel
  const handleExportAllToExcel = () => {
    const data = filteredCotizaciones.map((c) => ({
      'NO. COTIZACIÓN': c.numeroCotizacion,
      'REFERENCIA (REF)': c.referenciaRef,
      'ESTATUS': c.estatus,
      'FECHA DE PEDIDO': c.fechaPedido,
      'ATENDIÓ': c.atendio,
      'CLIENTE': c.nombreCliente,
      'CELULAR': c.celular,
      'EMAIL': c.email || '',
      'APARATO': c.aparato,
      'MARCA': c.marca,
      'MODELO': c.modelo,
      'SERIE': c.serie,
      'NOMBRE O NO. PARTE': c.nombreNumeroParte,
      'SUBTOTAL ($)': c.subtotal || 0,
      'IVA ($)': c.iva || 0,
      'TOTAL COSTO REFACCIÓN ($)': c.costoRefaccion || 0,
      'DETALLES DE OPERACIÓN': c.detallesOperacion,
      'DATOS DEL PEDIDO': c.datosPedido,
      'INFORMACIÓN CONFIDENCIAL': c.informacionConfidencial || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cotizaciones');
    XLSX.writeFile(wb, `Directorio_Cotizaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Status Badge styling
  const getStatusBadgeClass = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DEPOSITO') || s.includes('PAGADO') || s.includes('TOTAL')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('ANTICIPO')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (s.includes('AUTORIZADO') || s.includes('RECIBIDO')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('TRANSITO') || s.includes('PEDIDO') || s.includes('PLANTA')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    if (s.includes('PENDIENTE') || s.includes('COTIZADO')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('CANCELADO')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCotizaciones.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const pagedRecords = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredCotizaciones.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCotizaciones, validCurrentPage]);

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* HEADER DE MÓDULO & CONTROL DE VISTAS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Módulo de Cotización
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {cotizaciones.length} registros guardados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-600" />
            Cotizaciones de Refacciones & Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeTab === 'form'
              ? currentIndex >= 0 && cotizaciones[currentIndex]
                ? `Editando cotización #${formData.numeroCotizacion || '8292'}`
                : 'Formulario en blanco listo para registrar una nueva cotización o presupuesto de refacción.'
              : 'Buscador, consulta y administración general de cotizaciones y pedidos.'}
          </p>
        </div>

        {/* Botonera de Navegación de Vistas */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'form' ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="btn-ir-a-directorio-cotizaciones"
              className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer border border-slate-800"
              title="Ir al directorio general de cotizaciones"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Buscador de Registros / Directorio</span>
              <span className="bg-slate-800 text-blue-300 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ml-1">
                {cotizaciones.length}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNewRecord}
              id="btn-ir-a-nueva-cotizacion"
              className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Abrir formulario en blanco para nueva cotización"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Cotización</span>
            </button>
          )}

          {/* Exportación a Excel */}
          <button
            type="button"
            onClick={handleExportAllToExcel}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Exportar cotizaciones a archivo Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 1: FORMULARIO PRINCIPAL DE COTIZACIÓN */}
      {/* ========================================================================= */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          {/* Form Banner Header (Dark card with colored icon box like Agenda & Reportes) */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  {currentIndex >= 0 && cotizaciones[currentIndex]?.id === formData.id
                    ? 'Editar Cotización de Refacción'
                    : 'Registrar Nueva Cotización de Refacción'}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentIndex >= 0 && cotizaciones[currentIndex]?.id === formData.id
                    ? 'Modifica los datos del presupuesto, piezas y seguimiento del pedido.'
                    : 'Captura los datos del cliente, aparato, refacción solicitada y desglose de costos.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {/* Controles de Navegación Compactos entre Registros */}
              <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => loadRecordByIndex(0)}
                  disabled={cotizaciones.length === 0 || currentIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Primera cotización"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => loadRecordByIndex(Math.max(0, currentIndex - 1))}
                  disabled={cotizaciones.length === 0 || currentIndex <= 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Cotización anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNewRecord}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Limpiar para nueva cotización"
                >
                  Nuevo
                </button>
                <button
                  type="button"
                  onClick={() => loadRecordByIndex(Math.min(cotizaciones.length - 1, currentIndex + 1))}
                  disabled={cotizaciones.length === 0 || currentIndex >= cotizaciones.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Siguiente cotización"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => loadRecordByIndex(cotizaciones.length - 1)}
                  disabled={cotizaciones.length === 0 || currentIndex === cotizaciones.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Última cotización"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 font-medium">Asignación #:</span>
                <span className="font-mono font-black text-blue-400">#{formData.numeroCotizacion || 'N/A'}</span>
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
                {currentIndex >= 0 && cotizaciones.length > 0
                  ? `Cotización ${currentIndex + 1} de ${cotizaciones.length}`
                  : 'Nueva Cotización'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleNewRecord}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Limpiar formulario para nueva cotización"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>En Blanco (Nuevo)</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                disabled={!formData.nombreCliente}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Duplicar datos en nueva cotización"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Duplicar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (formData.nombreCliente) {
                    openPrint(formData as Cotizacion);
                  } else {
                    alert('Complete al menos el nombre del cliente para imprimir');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Formato formal de impresión"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (formData.nombreCliente) {
                    downloadPdf(formData as Cotizacion);
                  } else {
                    alert('Complete al menos el nombre del cliente para generar PDF');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Descargar PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF</span>
              </button>

              {formData.id && (
                <button
                  type="button"
                  onClick={() => requestDelete(formData as Cotizacion)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  title="Eliminar cotización actual"
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
                <span>Guardar Cotización</span>
              </button>
            </div>
          </div>

          {/* FORMULARIO ESTRUCTURADO */}
          <form onSubmit={handleSave} className="p-5 sm:p-7 space-y-6">
            {/* SECCIÓN 1: IDENTIDAD, CONTROL Y ESTATUS */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Control, Identidad & Estatus de la Cotización
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* No. Cotización */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    NO. COTIZACIÓN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroCotizacion || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numeroCotizacion: e.target.value }))
                    }
                    placeholder="Ej. 8292"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-rose-600 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden font-mono"
                  />
                </div>

                {/* REF */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    REF (No. Referencia / Rastreo)
                  </label>
                  <input
                    type="text"
                    value={formData.referenciaRef || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, referenciaRef: e.target.value }))
                    }
                    placeholder="Ej. 1360616891"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden font-mono"
                  />
                </div>

                {/* Estatus */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">STATUS</label>
                  <select
                    value={formData.estatus || 'DEPOSITO EL TOTAL'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, estatus: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden cursor-pointer"
                  >
                    {STATUS_COTIZACION_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Pedido */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    FECHA DE PEDIDO
                  </label>
                  <input
                    type="date"
                    value={formData.fechaPedido || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fechaPedido: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                  />
                </div>

                {/* Atendió */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ATENDIÓ</label>
                  <select
                    value={formData.atendio || 'RAUL'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, atendio: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden cursor-pointer"
                  >
                    {ATENDIO_OPTIONS.map((at) => (
                      <option key={at} value={at}>
                        {at}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL CLIENTE Y CONTACTO */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Datos del Cliente & Contacto
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Nombre del Cliente */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    NOMBRE DEL CLIENTE *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.nombreCliente || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, nombreCliente: e.target.value }))
                      }
                      placeholder="Ej. C8292 MIGUEL CORONADO"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden uppercase"
                    />
                  </div>
                </div>

                {/* Teléfono Fijo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    TELÉFONO FIJO
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={formData.telefono || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, telefono: e.target.value }))
                      }
                      placeholder="Ej. (662) 214-0000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                    />
                  </div>
                </div>

                {/* Celular / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    CELULAR / WHATSAPP
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={formData.celular || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, celular: e.target.value }))
                      }
                      placeholder="Ej. 6622111124"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                    />
                  </div>
                </div>

                {/* Email @ */}
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    EMAIL @
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="Ej. cliente@correo.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: INFORMACIÓN DEL APARATO / ELECTRODOMÉSTICO */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Identificación del Aparato / Electrodoméstico
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Aparato */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">APARATO</label>
                  <div className="relative">
                    <input
                      list="aparatos-list"
                      type="text"
                      value={formData.aparato || 'REFRIGERADOR'}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, aparato: e.target.value.toUpperCase() }))
                      }
                      placeholder="Ej. REFRIGERADOR"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                    />
                    <datalist id="aparatos-list">
                      {APARATO_OPTIONS.map((ap) => (
                        <option key={ap} value={ap} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">MARCA</label>
                  <div className="relative">
                    <input
                      list="marcas-list"
                      type="text"
                      value={formData.marca || 'SAMSUNG'}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, marca: e.target.value.toUpperCase() }))
                      }
                      placeholder="Ej. SAMSUNG"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                    />
                    <datalist id="marcas-list">
                      {MARCA_OPTIONS.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* *Modelo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <span>*MODELO (Requerido)</span>
                    <span className="text-amber-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.modelo || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, modelo: e.target.value.toUpperCase() }))
                    }
                    placeholder="Ej. RF22A4010S9/EM V00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden font-mono"
                  />
                </div>

                {/* Serie */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SERIE</label>
                  <input
                    type="text"
                    value={formData.serie || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, serie: e.target.value.toUpperCase() }))
                    }
                    placeholder="Ej. 0BA84BBT500928D"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: DETALLES DE LA COTIZACIÓN & REFACCIONES */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Nombre o Número de Parte & Refacciones Solicitadas
                </h3>
              </div>

              <div className="space-y-4">
                {/* Nombre o Número de Parte */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    NOMBRE O NÚMERO DE PARTE
                  </label>
                  <textarea
                    rows={3}
                    value={formData.nombreNumeroParte || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nombreNumeroParte: e.target.value }))
                    }
                    placeholder="Ej. 2 CANASTAS DE ACRILICO 1 IZQ Y OTRA DERECHA NOTA: EN PIEZAS ELECTRICAS NO HAY DEVOLUCION, NI GARANTIA al dia de hoy no hay en existencia 19/08/2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden resize-y"
                  />
                </div>

                {/* Nota de Política (Badge de Advertencia) */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">POLÍTICA INSTITUCIONAL FIJA: </span>
                    <span>{formData.notaPolitica || FIXED_POLICY_NOTE}</span>
                  </div>
                </div>

                {/* Detalles de la Operación */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    DETALLES DE LA OPERACIÓN
                  </label>
                  <textarea
                    rows={2}
                    value={formData.detallesOperacion || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, detallesOperacion: e.target.value }))
                    }
                    placeholder="Ej. EL DIA 19/08/2026 CLIENTE DEPOSITO EL TOTAL $1,914.00 Y SE LE HIZO FACTURA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden resize-y"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: COSTOS DE LA REFACCIÓN ($$) */}
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Costo de la Refacción e Importes ($)
                  </h3>
                </div>

                {/* Botón de cálculo rápido */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCalculateIVA}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Calcular IVA del 16% sobre el subtotal"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>+ IVA 16%</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleZeroIVA}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Establecer IVA en 0"
                  >
                    Sin IVA
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Subtotal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    SUBTOTAL ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.subtotal !== undefined ? formData.subtotal : ''}
                      onChange={(e) => handleSubtotalChange(parseFloat(e.target.value) || 0)}
                      placeholder="1650.00"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden font-mono"
                    />
                  </div>
                  <span className="text-2xs text-slate-400 mt-1 block">
                    {formatCurrency(formData.subtotal)}
                  </span>
                </div>

                {/* I.V.A. */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    I V A ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.iva !== undefined ? formData.iva : ''}
                      onChange={(e) => handleIVAChange(parseFloat(e.target.value) || 0)}
                      placeholder="264.00"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden font-mono"
                    />
                  </div>
                  <span className="text-2xs text-slate-400 mt-1 block">
                    {formatCurrency(formData.iva)} (16%)
                  </span>
                </div>

                {/* TOTAL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    TOTAL ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costoRefaccion !== undefined ? formData.costoRefaccion : ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          costoRefaccion: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="1914.00"
                      className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-black text-emerald-700 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-hidden font-mono"
                    />
                  </div>
                  <span className="text-2xs text-emerald-600 font-bold mt-1 block">
                    {formatCurrency(formData.costoRefaccion)} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: LOGÍSTICA DEL PEDIDO E INFORMACIÓN CONFIDENCIAL */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Logística del Pedido & Información Confidencial
                </h3>
              </div>

              <div className="space-y-4">
                {/* Datos del Pedido */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span>DATOS DEL PEDIDO:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.datosPedido || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, datosPedido: e.target.value }))
                    }
                    placeholder="Ej. Guía Fedex 884102941 - Proveedor Planta Samsung Central. Tiempo de arribo: 3 días hábiles."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden resize-y"
                  />
                </div>

                {/* Información Confidencial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>INFORMACIÓN CONFIDENCIAL:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.informacionConfidencial || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, informacionConfidencial: e.target.value }))
                    }
                    placeholder="Ej. Costo mayorista $980.00. Proveedor directo #204. Cuenta BBVA transferencia #99104."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden resize-y"
                  />
                </div>
              </div>
            </div>

            {/* BOTÓN FINAL DE GUARDAR */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleNewRecord}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cotización</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: DIRECTORIO Y BÚSQUEDA DE COTIZACIONES */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {/* TARJETAS RESUMEN DE MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Cotizaciones</span>
                <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Package className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{summaryMetrics.totalCount}</p>
              <span className="text-2xs text-slate-400 mt-0.5 block">Registros guardados</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Monto Total Cotizado</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">
                {formatCurrency(summaryMetrics.totalAmount)}
              </p>
              <span className="text-2xs text-emerald-600 font-semibold mt-0.5 block">
                Valor en refacciones
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Depósitos / Autorizados</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">
                {summaryMetrics.depositadosCount}
              </p>
              <span className="text-2xs text-blue-600 font-semibold mt-0.5 block">
                Con pago o aprobación
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pendientes / En Espera</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">
                {summaryMetrics.pendientesCount}
              </p>
              <span className="text-2xs text-amber-600 font-semibold mt-0.5 block">
                Por confirmar o pagar
              </span>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Input Buscador */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por ID exacto (ej. 8292), Cliente, REF, Marca, Modelo o Pieza..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón Nuevo Registro */}
              <button
                type="button"
                onClick={handleNewRecord}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Cotización</span>
              </button>

              {/* Exportar a Excel */}
              <button
                type="button"
                onClick={handleExportAllToExcel}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="Exportar listado a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>

              {/* Modo de Vista (Tarjetas / Tabla / Cuadrícula) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista de Tarjetas"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista de Tabla Compacta"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista Cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filtros Secundarios */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar:</span>
              </div>

              {/* Filtro Estatus */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">Todos los Estatus</option>
                {STATUS_COTIZACION_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Filtro Marca */}
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">Todas las Marcas</option>
                {MARCA_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Filtro Aparato */}
              <select
                value={aparatoFilter}
                onChange={(e) => {
                  setAparatoFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">Todos los Aparatos</option>
                {APARATO_OPTIONS.map((ap) => (
                  <option key={ap} value={ap}>
                    {ap}
                  </option>
                ))}
              </select>

              {/* Limpiar filtros */}
              {(searchQuery ||
                statusFilter !== 'all' ||
                brandFilter !== 'all' ||
                aparatoFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setBrandFilter('all');
                    aparatoFilter !== 'all' && setAparatoFilter('all');
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer ml-auto"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESULTADOS / SIN RESULTADOS */}
          {/* ========================================================================= */}
          {filteredCotizaciones.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-800">
                  {searchQuery
                    ? `Sin resultados para la búsqueda "${searchQuery}"`
                    : 'No se encontraron cotizaciones con los filtros seleccionados'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verifique el número de cotización, nombre de cliente o limpie los filtros para ver todos los registros.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setBrandFilter('all');
                    setAparatoFilter('all');
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Restablecer Búsqueda
                </button>
                <button
                  type="button"
                  onClick={handleNewRecord}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Crear Nueva Cotización
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ===================================================================== */}
              {/* MODO 1: TARJETAS DETALLADAS (Responsive 1-columna en móvil) */}
              {/* ===================================================================== */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 gap-3.5">
                  {pagedRecords.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3.5"
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs font-mono">
                            COT #{item.numeroCotizacion}
                          </span>
                          {item.referenciaRef && (
                            <span className="text-2xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                              REF: {item.referenciaRef}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border ${getStatusBadgeClass(
                              item.estatus
                            )}`}
                          >
                            {item.estatus}
                          </span>
                          <span className="text-2xs text-slate-400 hidden lg:inline">•</span>
                          <span className="text-2xs text-slate-400 hidden lg:inline">
                            {item.fechaPedido || 'Sin fecha'} • Atendió: {item.atendio || 'N/A'}
                          </span>
                        </div>

                        {/* Botonera de Acciones por Registro Unificada */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => openPrint(item)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Imprimir formato"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPdf(item)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Descargar PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateRecord(item)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplicar cotización"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const idx = cotizaciones.findIndex((c) => c.id === item.id);
                              loadRecordByIndex(idx >= 0 ? idx : 0);
                              setActiveTab('form');
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Editar cotización"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar cotización"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {/* Cliente */}
                        <div className="space-y-0.5">
                          <span className="text-2xs font-semibold text-slate-400 uppercase">
                            Cliente
                          </span>
                          <p className="font-bold text-slate-900">{item.nombreCliente}</p>
                          {item.celular && (
                            <p className="text-slate-500 text-2xs flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-slate-400" />
                              <span>{item.celular}</span>
                            </p>
                          )}
                        </div>

                        {/* Aparato / Marca / Modelo */}
                        <div className="space-y-0.5">
                          <span className="text-2xs font-semibold text-slate-400 uppercase">
                            Aparato & Modelo
                          </span>
                          <p className="font-bold text-slate-800">
                            {item.aparato} — {item.marca}
                          </p>
                          <p className="font-mono text-2xs text-slate-600">
                            Mod: {item.modelo} {item.serie ? `(S/N: ${item.serie})` : ''}
                          </p>
                        </div>

                        {/* Refacción Solicitada */}
                        <div className="space-y-0.5 sm:col-span-2 lg:col-span-1">
                          <span className="text-2xs font-semibold text-slate-400 uppercase">
                            Refacción Solicitada
                          </span>
                          <p className="text-slate-700 line-clamp-2 text-2xs font-medium">
                            {item.nombreNumeroParte || 'Sin detalles de pieza'}
                          </p>
                        </div>

                        {/* Costo / Importe Total */}
                        <div className="space-y-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-2xs font-semibold text-slate-500 uppercase block">
                            Importe Cotizado
                          </span>
                          <p className="text-base font-black text-emerald-700 font-mono">
                            {formatCurrency(item.costoRefaccion)}
                          </p>
                          <div className="flex items-center justify-between text-2xs text-slate-400">
                            <span>Sub: {formatCurrency(item.subtotal)}</span>
                            <span>IVA: {formatCurrency(item.iva)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pie de Tarjeta */}
                      {item.detallesOperacion && (
                        <div className="pt-2 border-t border-slate-100 text-2xs text-slate-400">
                          <span className="font-semibold text-slate-500">Operación:</span> {item.detallesOperacion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ===================================================================== */}
              {/* MODO 2: TABLA COMPACTA */}
              {/* ===================================================================== */}
              {viewMode === 'table' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-2xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-3.5">No. Cot</th>
                          <th className="py-3 px-3.5">Fecha</th>
                          <th className="py-3 px-3.5">Cliente</th>
                          <th className="py-3 px-3.5">Aparato / Marca</th>
                          <th className="py-3 px-3.5">Modelo</th>
                          <th className="py-3 px-3.5">Estatus</th>
                          <th className="py-3 px-3.5 text-right">Total ($)</th>
                          <th className="py-3 px-3.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedRecords.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold font-mono text-rose-600">
                              #{item.numeroCotizacion}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap">
                              {item.fechaPedido || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3.5 font-bold text-slate-900">
                              {item.nombreCliente}
                              {item.celular && (
                                <span className="block text-2xs text-slate-400 font-normal">
                                  {item.celular}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-700">
                              <span className="font-semibold">{item.aparato}</span>
                              <span className="text-slate-400 block text-2xs">{item.marca}</span>
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-2xs text-slate-600">
                              {item.modelo}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-2xs font-bold border ${getStatusBadgeClass(
                                  item.estatus
                                )}`}
                              >
                                {item.estatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-black font-mono text-emerald-700 whitespace-nowrap">
                              {formatCurrency(item.costoRefaccion)}
                            </td>
                            <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
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
                                  title="Duplicar cotización"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const idx = cotizaciones.findIndex((c) => c.id === item.id);
                                    loadRecordByIndex(idx >= 0 ? idx : 0);
                                    setActiveTab('form');
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Editar cotización"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestDelete(item)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar cotización"
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

              {/* ===================================================================== */}
              {/* MODO 3: CUADRÍCULA (Grid 2/3 columnas en desktop, 1 en móvil) */}
              {/* ===================================================================== */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {pagedRecords.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <span className="font-bold text-xs text-rose-600 font-mono">
                            #{item.numeroCotizacion}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-bold border ${getStatusBadgeClass(
                              item.estatus
                            )}`}
                          >
                            {item.estatus}
                          </span>
                        </div>

                        <div className="mt-2.5 space-y-1.5 text-xs">
                          <p className="font-bold text-slate-900 truncate">{item.nombreCliente}</p>
                          <p className="text-slate-600 text-2xs font-medium">
                            {item.aparato} — {item.marca} ({item.modelo})
                          </p>
                          <p className="text-slate-500 text-2xs line-clamp-2 bg-slate-50 p-2 rounded-lg">
                            {item.nombreNumeroParte || 'Sin refacción descrita'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                          <span className="text-2xs text-slate-400">{item.fechaPedido}</span>
                          <span className="text-sm font-black text-emerald-700 font-mono">
                            {formatCurrency(item.costoRefaccion)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1">
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
                              title="Duplicar cotización"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const idx = cotizaciones.findIndex((c) => c.id === item.id);
                                loadRecordByIndex(idx >= 0 ? idx : 0);
                                setActiveTab('form');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Editar cotización"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar cotización"
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

              {/* ===================================================================== */}
              {/* PAGINACIÓN */}
              {/* ===================================================================== */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
                  <span>
                    Mostrando {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                    {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredCotizaciones.length)} de{' '}
                    {filteredCotizaciones.length} cotizaciones
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
                ¿Eliminar cotización #{deleteCandidate.numeroCotizacion}?
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

      {/* ========================================================================= */}
      {/* MODAL DE IMPRESIÓN FORMAL Y MINIMALISTA */}
      {/* ========================================================================= */}
      {isPrintModalOpen && printRecord && (
        <FormatPrintPreview
          module="cotizacion"
          record={printRecord}
          company={company}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
