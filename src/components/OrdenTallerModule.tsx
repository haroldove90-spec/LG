import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileDown,
  FileSpreadsheet,
  Trash2,
  Edit,
  Eye,
  X,
  Save,
  Lock,
} from 'lucide-react';
import { OrdenTaller, StatusType, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { StatusBadge } from './StatusBadge';
import { STAFF_LIST, APPLIANCE_CATEGORIES, BRANDS_LIST } from '../data/initialData';
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

export const OrdenTallerModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [ordenes, setOrdenes] = useState<OrdenTaller[]>(() => StorageService.getOrdenesTaller());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrdenTaller | null>(null);
  const [previewRecord, setPreviewRecord] = useState<OrdenTaller | null>(null);

  const initialFormState: Partial<OrdenTaller> = {
    numeroOrdenTaller: StorageService.getNextOrdenTallerNumber(),
    estatus: 'Nuevo',
    fechaIngreso: new Date().toISOString().split('T')[0],
    atendio: STAFF_LIST[0],
    nombreCliente: '',
    direccion: '',
    colonia: '',
    telefono: '',
    celular: '',
    aparato: APPLIANCE_CATEGORIES[0],
    marca: BRANDS_LIST[0],
    modeloCode: '',
    serie: '',
    falla: '',
    accesoriosObservaciones: '',
    tecnicoAsignado: STAFF_LIST[1],
    presupuesto: 0,
    refacciones: '',
    numeroPedido: '',
    informacionConfidencial: '',
  };

  const [formData, setFormData] = useState<Partial<OrdenTaller>>(initialFormState);

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      numeroOrdenTaller: StorageService.getNextOrdenTallerNumber(),
      fechaIngreso: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: OrdenTaller) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta orden de taller?')) {
      const updated = StorageService.deleteOrdenTaller(id);
      setOrdenes(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCliente?.trim()) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }

    const itemToSave: OrdenTaller = {
      id: editingItem ? editingItem.id : `ot-${Date.now()}`,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      numeroOrdenTaller: formData.numeroOrdenTaller || StorageService.getNextOrdenTallerNumber(),
      estatus: formData.estatus || 'Nuevo',
      fechaIngreso: formData.fechaIngreso || new Date().toISOString().split('T')[0],
      atendio: formData.atendio || STAFF_LIST[0],
      nombreCliente: formData.nombreCliente || '',
      direccion: formData.direccion || '',
      colonia: formData.colonia || '',
      telefono: formData.telefono || '',
      celular: formData.celular || '',
      aparato: formData.aparato || APPLIANCE_CATEGORIES[0],
      marca: formData.marca || BRANDS_LIST[0],
      modeloCode: formData.modeloCode || '',
      serie: formData.serie || '',
      falla: formData.falla || '',
      accesoriosObservaciones: formData.accesoriosObservaciones || '',
      tecnicoAsignado: formData.tecnicoAsignado || STAFF_LIST[1],
      presupuesto: Number(formData.presupuesto || 0),
      refacciones: formData.refacciones || '',
      numeroPedido: formData.numeroPedido || '',
      informacionConfidencial: formData.informacionConfidencial || '',
    };

    const updated = StorageService.saveOrdenTaller(itemToSave);
    setOrdenes(updated);
    setIsModalOpen(false);
  };

  const filtered = useMemo(() => {
    return ordenes.filter((item) => {
      const matchesSearch =
        item.numeroOrdenTaller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nombreCliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modeloCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serie.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tecnicoAsignado.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.estatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ordenes, searchQuery, statusFilter]);

  const totalPresupuesto = useMemo(() => {
    return ordenes.reduce((acc, curr) => acc + (curr.presupuesto || 0), 0);
  }, [ordenes]);

  const enTallerCount = useMemo(() => {
    return ordenes.filter((item) => item.estatus === 'En Diagnóstico' || item.estatus === 'En Proceso' || item.estatus === 'En Espera de Refacciones').length;
  }, [ordenes]);

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <span>Órdenes de Taller (Carry-In)</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Módulo 3
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (ordenes.length > 0) {
                ExportService.exportToPdf('orden_taller', ordenes[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-rose-500 font-black text-[10px]">PDF</span>
            <span>Exportar</span>
          </button>
          <button
            onClick={() => ExportService.exportModuleListToExcel('orden_taller')}
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
            <span>Nueva Orden Taller</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por orden, cliente, modelo, serie o técnico..."
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
                <th className="p-3.5">Orden / Fecha</th>
                <th className="p-3.5">Cliente / Ubicación</th>
                <th className="p-3.5">Aparato / Marca / Modelo</th>
                <th className="p-3.5">Técnico Asignado</th>
                <th className="p-3.5">Estatus</th>
                <th className="p-3.5 text-right">Presupuesto</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-indigo-700 font-mono block">{item.numeroOrdenTaller}</span>
                      <span className="text-[11px] text-slate-400">{item.fechaIngreso}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 block">{item.nombreCliente}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-xs">{item.colonia || item.direccion || 'Sin dirección'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium block">{item.aparato} • {item.marca}</span>
                      <span className="text-[11px] text-slate-500">Mod: {item.modeloCode}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium">{item.tecnicoAsignado || 'Sin asignar'}</span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={item.estatus} />
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {formatCurrency(item.presupuesto)}
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
                          onClick={() => ExportService.exportToPdf('orden_taller', item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => ExportService.exportRecordToExcel('orden_taller', item)}
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
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No se encontraron órdenes de taller.
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
                  OT
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    {editingItem ? 'Editar Orden de Taller' : 'Nueva Orden de Taller (Carry-In)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {formData.numeroOrdenTaller} • Registro en banco y seguridad técnica
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
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500">No. Orden Taller</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.numeroOrdenTaller}
                          className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-indigo-600 cursor-not-allowed"
                        />
                      </div>
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
                        <label className="text-[10px] font-semibold text-slate-500">Fecha Ingreso</label>
                        <input
                          type="date"
                          value={formData.fechaIngreso}
                          onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500">Atendió</label>
                        <select
                          value={formData.atendio}
                          onChange={(e) => setFormData({ ...formData, atendio: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white truncate"
                        >
                          {STAFF_LIST.map((staff) => (
                            <option key={staff} value={staff}>
                              {staff}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Datos del Cliente y Ubicación */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Cliente y Ubicación
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">
                          Nombre del Cliente <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre completo..."
                          value={formData.nombreCliente}
                          onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500">Teléfono</label>
                          <input
                            type="tel"
                            placeholder="5558902233"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500">Celular</label>
                          <input
                            type="tel"
                            placeholder="5577665544"
                            value={formData.celular}
                            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Dirección</label>
                        <input
                          type="text"
                          placeholder="Calle, número..."
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Colonia / Municipio</label>
                        <input
                          type="text"
                          placeholder="Colonia, sector o municipio..."
                          value={formData.colonia}
                          onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Middle (5 cols) */}
                <div className="md:col-span-5 space-y-4">
                  {/* Bento Card: Datos del Aparato */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Datos del Aparato
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Aparato</label>
                        <select
                          value={formData.aparato}
                          onChange={(e) => setFormData({ ...formData, aparato: e.target.value })}
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
                        <label className="text-[10px] font-semibold text-slate-500">Marca</label>
                        <select
                          value={formData.marca}
                          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        >
                          {BRANDS_LIST.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Modelo Code</label>
                        <input
                          type="text"
                          placeholder="Ej. NN-CD87KS"
                          value={formData.modeloCode}
                          onChange={(e) => setFormData({ ...formData, modeloCode: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Número de Serie</label>
                        <input
                          type="text"
                          placeholder="Ej. PAN-1092837"
                          value={formData.serie}
                          onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Recepción y Diagnóstico */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recepción y Diagnóstico
                    </h3>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-500">Falla Reportada</label>
                      <textarea
                        rows={2}
                        placeholder="Síntoma o comportamiento anómalo..."
                        value={formData.falla}
                        onChange={(e) => setFormData({ ...formData, falla: e.target.value })}
                        className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Accesorios / Observaciones</label>
                        <textarea
                          rows={2}
                          placeholder="Cables, control remoto, detalles..."
                          value={formData.accesoriosObservaciones}
                          onChange={(e) => setFormData({ ...formData, accesoriosObservaciones: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Técnico Asignado</label>
                        <select
                          value={formData.tecnicoAsignado}
                          onChange={(e) => setFormData({ ...formData, tecnicoAsignado: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white truncate"
                        >
                          {STAFF_LIST.map((staff) => (
                            <option key={staff} value={staff}>
                              {staff}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Right (3 cols) */}
                <div className="md:col-span-3 space-y-4 flex flex-col">
                  {/* Bento Card Highlight: Presupuesto Financiero */}
                  <div className="bg-indigo-600 p-5 rounded-xl text-white shadow-lg space-y-3">
                    <h3 className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-2">
                      Presupuesto de Taller
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] opacity-80 font-semibold block mb-1">
                          Presupuesto Estimado ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.presupuesto || ''}
                          onChange={(e) => setFormData({ ...formData, presupuesto: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white font-black text-lg focus:outline-none focus:bg-white/20"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] opacity-80 font-semibold block mb-1">Refacciones</label>
                        <input
                          type="text"
                          placeholder="Piezas a ordenar..."
                          value={formData.refacciones}
                          onChange={(e) => setFormData({ ...formData, refacciones: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs placeholder:text-indigo-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] opacity-80 font-semibold block mb-1"># de Pedido</label>
                        <input
                          type="text"
                          placeholder="Ej. PED-551"
                          value={formData.numeroPedido}
                          onChange={(e) => setFormData({ ...formData, numeroPedido: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs placeholder:text-indigo-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Seguridad Confidencial */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] mb-2">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Área Restringida</span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Contraseñas de bloqueo, códigos de diagnóstico interno..."
                        value={formData.informacionConfidencial}
                        onChange={(e) => setFormData({ ...formData, informacionConfidencial: e.target.value })}
                        className="w-full text-[11px] text-amber-900 border border-amber-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>
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
                  <span>Guardar Orden Taller</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Format Print / Preview Modal */}
      {previewRecord && (
        <FormatPrintPreview
          module="orden_taller"
          record={previewRecord}
          company={company}
          isOpen={Boolean(previewRecord)}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </div>
  );
};
