import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileDown,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit,
  Eye,
  Upload,
  X,
  Calculator,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { FolioSeguimiento, StatusType, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { StatusBadge } from './StatusBadge';
import { STAFF_LIST, APPLIANCE_CATEGORIES } from '../data/initialData';
import { FormatPrintPreview } from './FormatPrintPreview';

const STATUS_OPTIONS: StatusType[] = [
  'Nuevo',
  'En Diagnóstico',
  'Presupuestado',
  'Esperando Aprobación',
  'En Reparación',
  'Esperando Refacciones',
  'Listo para Entrega',
  'Entregado / Cerrado',
  'Cancelado',
];

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const FolioSeguimientoModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [folios, setFolios] = useState<FolioSeguimiento[]>(() => StorageService.getFolios());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FolioSeguimiento | null>(null);
  const [previewRecord, setPreviewRecord] = useState<FolioSeguimiento | null>(null);

  // Form State
  const initialFormState: Partial<FolioSeguimiento> = {
    folio: StorageService.getNextFolioNumber(),
    estatus: 'Nuevo',
    fecha: new Date().toISOString().split('T')[0],
    atendio: STAFF_LIST[0],
    numeroOrden: '',
    cliente: '',
    equipoCategoria: APPLIANCE_CATEGORIES[0],
    modelo: '',
    serie: '',
    reparacionConsisteEn: '',
    costosReparacionDesglose: '',
    reparacionTotal: 0,
    revisionPagada: 0,
    anticipoRequerido: 0,
    restanReparacion: 0,
    vigenciaPresupuesto: '15 días naturales',
    numeroParte: '',
    observaciones: '',
    adjuntos: [],
  };

  const [formData, setFormData] = useState<Partial<FolioSeguimiento>>(initialFormState);

  // Auto calculate 70% and restan whenever reparacionTotal or revisionPagada changes
  const handleCostChange = (field: 'reparacionTotal' | 'revisionPagada', value: number) => {
    const total = field === 'reparacionTotal' ? value : Number(formData.reparacionTotal || 0);
    const revision = field === 'revisionPagada' ? value : Number(formData.revisionPagada || 0);

    const anticipo = Math.round(total * 0.7 * 100) / 100;
    const restan = Math.max(0, Math.round((total - revision) * 100) / 100);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      anticipoRequerido: anticipo,
      restanReparacion: restan,
    }));
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      folio: StorageService.getNextFolioNumber(),
      fecha: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FolioSeguimiento) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este folio de seguimiento?')) {
      const updated = StorageService.deleteFolio(id);
      setFolios(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente?.trim()) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }

    const itemToSave: FolioSeguimiento = {
      id: editingItem ? editingItem.id : `fol-${Date.now()}`,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folio: formData.folio || StorageService.getNextFolioNumber(),
      estatus: formData.estatus || 'Nuevo',
      fecha: formData.fecha || new Date().toISOString().split('T')[0],
      atendio: formData.atendio || STAFF_LIST[0],
      numeroOrden: formData.numeroOrden || '',
      cliente: formData.cliente || '',
      equipoCategoria: formData.equipoCategoria || APPLIANCE_CATEGORIES[0],
      modelo: formData.modelo || '',
      serie: formData.serie || '',
      reparacionConsisteEn: formData.reparacionConsisteEn || '',
      costosReparacionDesglose: formData.costosReparacionDesglose || '',
      reparacionTotal: Number(formData.reparacionTotal || 0),
      revisionPagada: Number(formData.revisionPagada || 0),
      anticipoRequerido: Number(formData.anticipoRequerido || 0),
      restanReparacion: Number(formData.restanReparacion || 0),
      vigenciaPresupuesto: formData.vigenciaPresupuesto || '15 días naturales',
      numeroParte: formData.numeroParte || '',
      observaciones: formData.observaciones || '',
      adjuntos: formData.adjuntos || [],
    };

    const updated = StorageService.saveFolio(itemToSave);
    setFolios(updated);
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAdj: { name: string; size: string; type: string }[] = [];
    Array.from(files).forEach((file: File) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      newAdj.push({
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.type,
      });
    });
    setFormData((prev) => ({
      ...prev,
      adjuntos: [...(prev.adjuntos || []), ...newAdj],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      adjuntos: (prev.adjuntos || []).filter((_, i) => i !== index),
    }));
  };

  const filteredFolios = useMemo(() => {
    return folios.filter((item) => {
      const matchesSearch =
        item.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.numeroOrden.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serie.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.estatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [folios, searchQuery, statusFilter]);

  const totalReparaciones = useMemo(() => {
    return folios.reduce((acc, curr) => acc + (curr.reparacionTotal || 0), 0);
  }, [folios]);

  const totalAnticipos = useMemo(() => {
    return folios.reduce((acc, curr) => acc + (curr.anticipoRequerido || 0), 0);
  }, [folios]);

  const totalRestan = useMemo(() => {
    return folios.reduce((acc, curr) => acc + (curr.restanReparacion || 0), 0);
  }, [folios]);

  const enProcesoCount = useMemo(() => {
    return folios.filter((item) => item.estatus === 'En Reparación' || item.estatus === 'En Diagnóstico' || item.estatus === 'Nuevo').length;
  }, [folios]);

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <span>Folios de Seguimiento & Diagnóstico</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Módulo 3
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (folios.length > 0) {
                ExportService.exportToPdf('folio_seguimiento', folios[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-rose-500 font-black text-[10px]">PDF</span>
            <span>Exportar</span>
          </button>
          <button
            onClick={() => ExportService.exportModuleListToExcel('folio_seguimiento')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-emerald-600 font-black text-[10px]">XLS</span>
            <span>Reporte</span>
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Folio</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente, modelo, serie u orden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filtrar Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data (Bento Card Container) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Folio / Fecha</th>
                <th className="p-3.5">Cliente / Orden</th>
                <th className="p-3.5">Equipo & Modelo</th>
                <th className="p-3.5">Estatus</th>
                <th className="p-3.5 text-right">Reparación Total</th>
                <th className="p-3.5 text-right">Anticipo (70%)</th>
                <th className="p-3.5 text-right">Restan</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFolios.length > 0 ? (
                filteredFolios.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-indigo-700 font-mono block">{item.folio}</span>
                      <span className="text-[11px] text-slate-400">{item.fecha}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 block">{item.cliente}</span>
                      <span className="text-[11px] text-slate-500">Orden: {item.numeroOrden || 'S/N'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium block">{item.equipoCategoria}</span>
                      <span className="text-[11px] text-slate-500">{item.modelo}</span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={item.estatus} />
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {formatCurrency(item.reparacionTotal)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-amber-600">
                      {formatCurrency(item.anticipoRequerido)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">
                      {formatCurrency(item.restanReparacion)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setPreviewRecord(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver Formato / Imprimir"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => ExportService.exportToPdf('folio_seguimiento', item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => ExportService.exportRecordToExcel('folio_seguimiento', item)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Descargar Excel"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No se encontraron folios con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL (Bento Grid Architecture) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#F1F5F9] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  FS
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    {editingItem ? 'Editar Folio de Seguimiento' : 'Registro de Folio'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {formData.folio} • Captura técnica y financiera
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bento Grid 12-column Form Layout */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Column 1: Left (4 cols) */}
                <div className="md:col-span-4 space-y-4">
                  {/* Bento Card: Encabezado y Control */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Encabezado y Control
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Estatus</label>
                        <select
                          value={formData.estatus}
                          onChange={(e) => setFormData({ ...formData, estatus: e.target.value as StatusType })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Fecha</label>
                        <input
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500">Atendió (Personal)</label>
                        <select
                          value={formData.atendio}
                          onChange={(e) => setFormData({ ...formData, atendio: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white truncate"
                        >
                          {STAFF_LIST.map((staff) => (
                            <option key={staff} value={staff}>
                              {staff}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500">Folio Seguimiento</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.folio}
                          className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-indigo-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Información del Cliente */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Información del Cliente
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Número de Orden</label>
                        <input
                          type="text"
                          placeholder="Ej. ORD-5520"
                          value={formData.numeroOrden}
                          onChange={(e) => setFormData({ ...formData, numeroOrden: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">
                          Cliente (Nombre) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Nombre del cliente..."
                            value={formData.cliente}
                            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white pr-8"
                          />
                          <span className="absolute right-2.5 top-2 opacity-40 text-xs">🔍</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Middle (5 cols) */}
                <div className="md:col-span-5 space-y-4">
                  {/* Bento Card: Detalles del Equipo y Diagnóstico */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Detalles del Equipo y Diagnóstico
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Equipo (Categoría)</label>
                        <select
                          value={formData.equipoCategoria}
                          onChange={(e) => setFormData({ ...formData, equipoCategoria: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        >
                          {APPLIANCE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Modelo</label>
                        <input
                          type="text"
                          placeholder="Ej. LGM-502"
                          value={formData.modelo}
                          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500">Número de Serie</label>
                        <input
                          type="text"
                          placeholder="SN-X920239102"
                          value={formData.serie}
                          onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-500">
                        Trabajo Realizado / Diagnóstico
                      </label>
                      <textarea
                        rows={3}
                        placeholder="La reparación consiste en remplazar el sensor de temperatura y limpieza de conductos..."
                        value={formData.reparacionConsisteEn}
                        onChange={(e) => setFormData({ ...formData, reparacionConsisteEn: e.target.value })}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                      />
                    </div>
                  </div>

                  {/* Bento Card: Extras y Archivos */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Extras y Archivos
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Num. de Parte</label>
                        <input
                          type="text"
                          placeholder="Ej. TCA38091801"
                          value={formData.numeroParte}
                          onChange={(e) => setFormData({ ...formData, numeroParte: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Vigencia de Presupuesto</label>
                        <input
                          type="text"
                          placeholder="15 días hábiles"
                          value={formData.vigenciaPresupuesto}
                          onChange={(e) => setFormData({ ...formData, vigenciaPresupuesto: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-500">Adjuntos (Evidencia)</label>
                      <label className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center">
                        <Upload className="w-4 h-4 text-indigo-500 mb-1" />
                        <p className="text-[10px] text-slate-500 font-medium">
                          Arrastra imágenes o haz clic para subir
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {formData.adjuntos && formData.adjuntos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {formData.adjuntos.map((file, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1.5 text-[10px] text-slate-700"
                            >
                              <span className="truncate max-w-[120px]">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Right (3 cols) */}
                <div className="md:col-span-3 space-y-4 flex flex-col">
                  {/* Bento Card Highlight: Resumen Financiero */}
                  <div className="bg-indigo-600 p-5 rounded-xl text-white shadow-lg space-y-3">
                    <h3 className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-2">
                      Resumen Financiero
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] opacity-80 font-semibold block mb-1">
                          Reparación Total ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.reparacionTotal || ''}
                          onChange={(e) => handleCostChange('reparacionTotal', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm focus:outline-none focus:bg-white/20"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] opacity-80 font-semibold block mb-1">
                          Revisión Pagada ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.revisionPagada || ''}
                          onChange={(e) => handleCostChange('revisionPagada', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-emerald-300 font-semibold focus:outline-none focus:bg-white/20"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="h-px bg-white/20 my-1" />
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold opacity-90">Anticipo (70%)</span>
                        <span className="font-bold text-amber-300">
                          {formatCurrency(formData.anticipoRequerido)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-white/10 rounded-lg border border-white/10">
                        <span className="text-[11px] font-bold">Resta a Pagar</span>
                        <span className="text-base font-black">
                          {formatCurrency(formData.restanReparacion)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Observaciones Internas */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex-1 flex flex-col">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Observaciones Internas
                    </h3>
                    <textarea
                      rows={5}
                      placeholder="El equipo presenta ligero golpe en la parte trasera que no afecta funcionamiento..."
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className="w-full flex-1 text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none italic text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Bento Footer Action Bar */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Format Print / Preview Modal */}
      {previewRecord && (
        <FormatPrintPreview
          module="folio_seguimiento"
          record={previewRecord}
          company={company}
          isOpen={Boolean(previewRecord)}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </div>
  );
};
