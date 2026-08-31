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
  AlertTriangle,
} from 'lucide-react';
import { Cotizacion, StatusType, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { StatusBadge } from './StatusBadge';
import { STAFF_LIST, APPLIANCE_CATEGORIES, BRANDS_LIST } from '../data/initialData';
import { FormatPrintPreview } from './FormatPrintPreview';

const STATUS_OPTIONS: StatusType[] = [
  'Nuevo',
  'Presupuestado',
  'Esperando Aprobación',
  'Esperando Refacciones',
  'Entregado / Cerrado',
  'Cancelado',
];

const FIXED_POLICY_NOTE = 'En piezas eléctricas no hay devolución, ni garantía';

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const CotizacionModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(() => StorageService.getCotizaciones());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cotizacion | null>(null);
  const [previewRecord, setPreviewRecord] = useState<Cotizacion | null>(null);

  const initialFormState: Partial<Cotizacion> = {
    numeroCotizacion: StorageService.getNextCotizacionNumber(),
    referenciaRef: '',
    estatus: 'Nuevo',
    fechaPedido: new Date().toISOString().split('T')[0],
    atendio: STAFF_LIST[0],
    nombreCliente: '',
    telefono: '',
    celular: '',
    aparato: APPLIANCE_CATEGORIES[0],
    marca: BRANDS_LIST[0],
    modelo: '',
    serie: '',
    nombreNumeroParte: '',
    notaPolitica: FIXED_POLICY_NOTE,
    detallesOperacion: '',
    costoRefaccion: 0,
    datosPedido: '',
  };

  const [formData, setFormData] = useState<Partial<Cotizacion>>(initialFormState);

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      numeroCotizacion: StorageService.getNextCotizacionNumber(),
      fechaPedido: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Cotizacion) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta cotización?')) {
      const updated = StorageService.deleteCotizacion(id);
      setCotizaciones(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCliente?.trim()) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }
    if (!formData.modelo?.trim()) {
      alert('El campo Modelo es obligatorio');
      return;
    }

    const itemToSave: Cotizacion = {
      id: editingItem ? editingItem.id : `cot-${Date.now()}`,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      numeroCotizacion: formData.numeroCotizacion || StorageService.getNextCotizacionNumber(),
      referenciaRef: formData.referenciaRef || '',
      estatus: formData.estatus || 'Nuevo',
      fechaPedido: formData.fechaPedido || new Date().toISOString().split('T')[0],
      atendio: formData.atendio || STAFF_LIST[0],
      nombreCliente: formData.nombreCliente || '',
      telefono: formData.telefono || '',
      celular: formData.celular || '',
      aparato: formData.aparato || APPLIANCE_CATEGORIES[0],
      marca: formData.marca || BRANDS_LIST[0],
      modelo: formData.modelo || '',
      serie: formData.serie || '',
      nombreNumeroParte: formData.nombreNumeroParte || '',
      notaPolitica: FIXED_POLICY_NOTE,
      detallesOperacion: formData.detallesOperacion || '',
      costoRefaccion: Number(formData.costoRefaccion || 0),
      datosPedido: formData.datosPedido || '',
    };

    const updated = StorageService.saveCotizacion(itemToSave);
    setCotizaciones(updated);
    setIsModalOpen(false);
  };

  const filtered = useMemo(() => {
    return cotizaciones.filter((item) => {
      const matchesSearch =
        item.numeroCotizacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenciaRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nombreCliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nombreNumeroParte.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.estatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cotizaciones, searchQuery, statusFilter]);

  const totalCostoRefacciones = useMemo(() => {
    return cotizaciones.reduce((acc, curr) => acc + (curr.costoRefaccion || 0), 0);
  }, [cotizaciones]);

  const pendientesCount = useMemo(() => {
    return cotizaciones.filter((item) => item.estatus === 'Nuevo' || item.estatus === 'En Diagnóstico' || item.estatus === 'En Espera de Refacciones').length;
  }, [cotizaciones]);

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <span>Cotizaciones de Refacciones & Pedidos</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Módulo 4
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (cotizaciones.length > 0) {
                ExportService.exportToPdf('cotizacion', cotizaciones[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-rose-500 font-black text-[10px]">PDF</span>
            <span>Exportar</span>
          </button>
          <button
            onClick={() => ExportService.exportModuleListToExcel('cotizacion')}
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
            <span>Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cotización, REF, cliente, modelo o parte..."
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
                <th className="p-3.5">No. Cotización / REF</th>
                <th className="p-3.5">Cliente / Contacto</th>
                <th className="p-3.5">Aparato / Marca / Modelo</th>
                <th className="p-3.5">Refacción Solicitada</th>
                <th className="p-3.5">Estatus</th>
                <th className="p-3.5 text-right">Costo Refacción</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-indigo-700 font-mono block">{item.numeroCotizacion}</span>
                      <span className="text-[11px] text-slate-400">REF: {item.referenciaRef || 'N/A'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 block">{item.nombreCliente}</span>
                      <span className="text-[11px] text-slate-500">{item.telefono || item.celular || 'Sin teléfono'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium block">{item.aparato} ({item.marca})</span>
                      <span className="text-[11px] text-slate-500">Mod: {item.modelo}</span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate" title={item.nombreNumeroParte}>
                      <span className="text-slate-800 font-medium">{item.nombreNumeroParte}</span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={item.estatus} />
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {formatCurrency(item.costoRefaccion)}
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
                          onClick={() => ExportService.exportToPdf('cotizacion', item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => ExportService.exportRecordToExcel('cotizacion', item)}
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
                    No se encontraron cotizaciones con los criterios seleccionados.
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
                  COT
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    {editingItem ? 'Editar Cotización' : 'Nueva Cotización de Refacciones'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {formData.numeroCotizacion} • Presupuesto de partes y logística
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
                        <label className="text-[10px] font-semibold text-slate-500">No. Cotización</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.numeroCotizacion}
                          className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-indigo-600 cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Referencia (REF)</label>
                        <input
                          type="text"
                          placeholder="Ej. REF-102"
                          value={formData.referenciaRef}
                          onChange={(e) => setFormData({ ...formData, referenciaRef: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                        <label className="text-[10px] font-semibold text-slate-500">Fecha de Pedido</label>
                        <input
                          type="date"
                          value={formData.fechaPedido}
                          onChange={(e) => setFormData({ ...formData, fechaPedido: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Atendió</label>
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
                    </div>
                  </div>

                  {/* Bento Card: Datos del Cliente */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Datos del Cliente
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">
                          Nombre del Cliente <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre del cliente..."
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
                            placeholder="5551234567"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500">Celular</label>
                          <input
                            type="tel"
                            placeholder="5541908722"
                            value={formData.celular}
                            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                          />
                        </div>
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
                    <div className="grid grid-cols-2 gap-3 mb-3">
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
                        <label className="text-[10px] font-semibold text-slate-500">
                          Modelo <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. AR24TSHZAWK"
                          value={formData.modelo}
                          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Número de Serie</label>
                        <input
                          type="text"
                          placeholder="SM-99283"
                          value={formData.serie}
                          onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Refacción y Logística */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Refacción y Logística
                    </h3>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-500">
                        Nombre o Número de Parte (Texto)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. DB92-04029A - Tarjeta Electrónica Principal Exterior"
                        value={formData.nombreNumeroParte}
                        onChange={(e) => setFormData({ ...formData, nombreNumeroParte: e.target.value })}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Detalles de Operación</label>
                        <textarea
                          rows={3}
                          placeholder="Disponibilidad, tiempos de entrega de fábrica..."
                          value={formData.detallesOperacion}
                          onChange={(e) => setFormData({ ...formData, detallesOperacion: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-500">Datos del Pedido</label>
                        <textarea
                          rows={3}
                          placeholder="Requisición de almacén, proveedor asignado..."
                          value={formData.datosPedido}
                          onChange={(e) => setFormData({ ...formData, datosPedido: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Right (3 cols) */}
                <div className="md:col-span-3 space-y-4 flex flex-col">
                  {/* Bento Card Highlight: Costo Refacción */}
                  <div className="bg-indigo-600 p-5 rounded-xl text-white shadow-lg space-y-3">
                    <h3 className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-2">
                      Cotización Financiera
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] opacity-80 font-semibold block mb-1">
                          Costo de la Refacción ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.costoRefaccion || ''}
                          onChange={(e) => setFormData({ ...formData, costoRefaccion: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white font-black text-lg focus:outline-none focus:bg-white/20"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-lg border border-white/10 text-[11px] space-y-1">
                        <span className="font-bold block text-amber-300">Condición Comercial:</span>
                        <p className="opacity-90 leading-tight text-[10px]">
                          Precios sujetos a cambio sin previo aviso y disponibilidad de inventario.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bento Card: Política Oficial */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Política Fija</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed italic bg-white p-2.5 rounded-lg border border-amber-200">
                        "{FIXED_POLICY_NOTE}"
                      </p>
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
                  <span>Guardar Cotización</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Format Print / Preview Modal */}
      {previewRecord && (
        <FormatPrintPreview
          module="cotizacion"
          record={previewRecord}
          company={company}
          isOpen={Boolean(previewRecord)}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </div>
  );
};
