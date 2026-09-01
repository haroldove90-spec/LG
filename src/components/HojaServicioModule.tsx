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
  PlusCircle,
  Calculator,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { HojaServicio, RefaccionItem, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';
import { STAFF_LIST, APPLIANCE_CATEGORIES, BRANDS_LIST } from '../data/initialData';
import { SignaturePad } from './SignaturePad';
import { FormatPrintPreview } from './FormatPrintPreview';
import { EvidencePhotoManager } from './EvidencePhotoManager';

const TIPO_SERVICIO_OPTIONS: HojaServicio['tipoServicio'][] = [
  'In-Home (Domicilio)',
  'Taller (Carry-In)',
  'Comercial',
  'Revisión Especializada',
];

const VALIDACION_GARANTIA_OPTIONS: HojaServicio['validacionGarantia'][] = [
  'Por documento (Póliza/Factura)',
  'Por número de serie (Sistema)',
  'Fuera de Garantía',
  'En Validación',
];

const MOTIVO_PAGO_OPTIONS: HojaServicio['motivoPago'][] = [
  'Instalación',
  'Reparación',
  'Material',
  'Visita/Diagnóstico',
  'Anticipo',
  'Liquidación Total',
];

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const HojaServicioModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [hojas, setHojas] = useState<HojaServicio[]>(() => StorageService.getHojasServicio());
  const [searchQuery, setSearchQuery] = useState('');
  const [garantiaFilter, setGarantiaFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HojaServicio | null>(null);
  const [previewRecord, setPreviewRecord] = useState<HojaServicio | null>(null);

  const initialFormState: Partial<HojaServicio> = {
    folioLGEMS: StorageService.getNextHojaServicioNumber(),
    centroServicioAutorizado: company.authorizedCenter,
    tipoServicio: 'In-Home (Domicilio)',
    garantia: 'Sí',
    fechaRecepcion: new Date().toISOString().split('T')[0],
    fechaRequerida: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    fechaInicioAtencion: new Date().toISOString().split('T')[0],
    fechaFinAtencion: '',
    fechaEntrega: '',
    nombreCompleto: '',
    domicilioCompleto: '',
    colonia: '',
    ciudad: 'Ciudad de México',
    estado: 'CDMX',
    codigoPostal: '',
    telefonoFijo: '',
    celular: '',
    tipoProducto: APPLIANCE_CATEGORIES[0],
    modelo: '',
    numeroSerie: '',
    distribuidor: 'Distribuidor Autorizado',
    fechaCompra: new Date().toISOString().split('T')[0],
    sintomaFallaReportada: '',
    observacionesDiagnostico: '',
    hayTierraFisica: 'Sí',
    voltajeDomicilio: '120 VAC',
    presionAguaPSI: '35 PSI',
    presionGas: '11 inH2O',
    condicionesFisicas: {
      golpesRayones: false,
      faltanTornillos: false,
      intervenidoTerceros: false,
      humedadOxido: false,
      cablesDañados: false,
      limpioYCompleto: true,
      detallesExtras: '',
    },
    tecnicoAsignado: STAFF_LIST[1],
    fechaConfirmacionVisita: new Date().toISOString().split('T')[0],
    refacciones: [
      {
        id: `ref-${Date.now()}-1`,
        numeroParte: '',
        descripcion: '',
        cantidad: 1,
        monto: 0,
      },
    ],
    manoDeObra: 0,
    transporte: 0,
    visita: 0,
    materiales: 0,
    repuestosMonto: 0,
    ivaPorcentaje: 16,
    ivaMonto: 0,
    total: 0,
    realizoPago: 'No',
    cantidadPagada: 0,
    motivoPago: 'Reparación',
    validacionGarantia: 'Por documento (Póliza/Factura)',
    nombreTecnico: STAFF_LIST[1],
    firmaTecnicoDataUrl: '',
    nombreClienteFirma: '',
    firmaClienteDataUrl: '',
  };

  const [formData, setFormData] = useState<Partial<HojaServicio>>(initialFormState);

  // Recalculate totals
  const recalculateFinancials = (data: Partial<HojaServicio>) => {
    const mo = Number(data.manoDeObra || 0);
    const tr = Number(data.transporte || 0);
    const vis = Number(data.visita || 0);
    const mat = Number(data.materiales || 0);

    const sumRef = (data.refacciones || []).reduce(
      (acc, curr) => acc + (Number(curr.cantidad) || 0) * (Number(curr.monto) || 0),
      0
    );

    const subtotal = mo + tr + vis + mat + sumRef;
    const ivaPct = Number(data.ivaPorcentaje || 16);
    const iva = Math.round(((subtotal * ivaPct) / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal + iva) * 100) / 100;

    return {
      ...data,
      repuestosMonto: sumRef,
      ivaMonto: iva,
      total: grandTotal,
    };
  };

  const handleFinancialChange = (field: keyof HojaServicio, val: any) => {
    const next = { ...formData, [field]: val };
    const updated = recalculateFinancials(next);
    setFormData(updated);
  };

  const handleRefaccionChange = (index: number, field: keyof RefaccionItem, val: any) => {
    const currentRef = [...(formData.refacciones || [])];
    currentRef[index] = { ...currentRef[index], [field]: val };
    const next = { ...formData, refacciones: currentRef };
    const updated = recalculateFinancials(next);
    setFormData(updated);
  };

  const addRefaccionRow = () => {
    const currentRef = [
      ...(formData.refacciones || []),
      {
        id: `ref-${Date.now()}-${Math.random()}`,
        numeroParte: '',
        descripcion: '',
        cantidad: 1,
        monto: 0,
      },
    ];
    const next = { ...formData, refacciones: currentRef };
    const updated = recalculateFinancials(next);
    setFormData(updated);
  };

  const removeRefaccionRow = (index: number) => {
    const currentRef = (formData.refacciones || []).filter((_, i) => i !== index);
    const next = { ...formData, refacciones: currentRef };
    const updated = recalculateFinancials(next);
    setFormData(updated);
  };

  const openNewModal = () => {
    setEditingItem(null);
    const base = {
      ...initialFormState,
      folioLGEMS: StorageService.getNextHojaServicioNumber(),
      fechaRecepcion: new Date().toISOString().split('T')[0],
      fechaInicioAtencion: new Date().toISOString().split('T')[0],
      fechaConfirmacionVisita: new Date().toISOString().split('T')[0],
    };
    setFormData(recalculateFinancials(base));
    setIsModalOpen(true);
  };

  const openEditModal = (item: HojaServicio) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta hoja oficial de servicio?')) {
      const updated = StorageService.deleteHojaServicio(id);
      setHojas(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCompleto?.trim()) {
      alert('Por favor ingrese el nombre completo del cliente');
      return;
    }

    const calculated = recalculateFinancials(formData);

    const itemToSave: HojaServicio = {
      id: editingItem ? editingItem.id : `hs-${Date.now()}`,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folioLGEMS: calculated.folioLGEMS || StorageService.getNextHojaServicioNumber(),
      centroServicioAutorizado: calculated.centroServicioAutorizado || company.authorizedCenter,
      tipoServicio: calculated.tipoServicio || 'In-Home (Domicilio)',
      garantia: calculated.garantia || 'Sí',
      fechaRecepcion: calculated.fechaRecepcion || new Date().toISOString().split('T')[0],
      fechaRequerida: calculated.fechaRequerida || '',
      fechaInicioAtencion: calculated.fechaInicioAtencion || '',
      fechaFinAtencion: calculated.fechaFinAtencion || '',
      fechaEntrega: calculated.fechaEntrega || '',
      nombreCompleto: calculated.nombreCompleto || '',
      domicilioCompleto: calculated.domicilioCompleto || '',
      colonia: calculated.colonia || '',
      ciudad: calculated.ciudad || 'Ciudad de México',
      estado: calculated.estado || 'CDMX',
      codigoPostal: calculated.codigoPostal || '',
      telefonoFijo: calculated.telefonoFijo || '',
      celular: calculated.celular || '',
      tipoProducto: calculated.tipoProducto || APPLIANCE_CATEGORIES[0],
      modelo: calculated.modelo || '',
      numeroSerie: calculated.numeroSerie || '',
      distribuidor: calculated.distribuidor || '',
      fechaCompra: calculated.fechaCompra || '',
      sintomaFallaReportada: calculated.sintomaFallaReportada || '',
      observacionesDiagnostico: calculated.observacionesDiagnostico || '',
      hayTierraFisica: calculated.hayTierraFisica || 'Sí',
      voltajeDomicilio: calculated.voltajeDomicilio || '',
      presionAguaPSI: calculated.presionAguaPSI || '',
      presionGas: calculated.presionGas || '',
      condicionesFisicas: calculated.condicionesFisicas || {
        golpesRayones: false,
        faltanTornillos: false,
        intervenidoTerceros: false,
        humedadOxido: false,
        cablesDañados: false,
        limpioYCompleto: true,
      },
      tecnicoAsignado: calculated.tecnicoAsignado || STAFF_LIST[1],
      fechaConfirmacionVisita: calculated.fechaConfirmacionVisita || '',
      refacciones: calculated.refacciones || [],
      manoDeObra: Number(calculated.manoDeObra || 0),
      transporte: Number(calculated.transporte || 0),
      visita: Number(calculated.visita || 0),
      materiales: Number(calculated.materiales || 0),
      repuestosMonto: Number(calculated.repuestosMonto || 0),
      ivaPorcentaje: Number(calculated.ivaPorcentaje || 16),
      ivaMonto: Number(calculated.ivaMonto || 0),
      total: Number(calculated.total || 0),
      realizoPago: calculated.realizoPago || 'No',
      cantidadPagada: Number(calculated.cantidadPagada || 0),
      motivoPago: calculated.motivoPago || 'Reparación',
      validacionGarantia: calculated.validacionGarantia || 'Por documento (Póliza/Factura)',
      nombreTecnico: calculated.nombreTecnico || calculated.tecnicoAsignado || '',
      firmaTecnicoDataUrl: calculated.firmaTecnicoDataUrl || '',
      nombreClienteFirma: calculated.nombreClienteFirma || calculated.nombreCompleto || '',
      firmaClienteDataUrl: calculated.firmaClienteDataUrl || '',
    };

    const updated = StorageService.saveHojaServicio(itemToSave);
    setHojas(updated);
    setIsModalOpen(false);
  };

  const filtered = useMemo(() => {
    return hojas.filter((item) => {
      const matchesSearch =
        item.folioLGEMS.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.numeroSerie.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tecnicoAsignado.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGarantia = garantiaFilter === 'all' || item.garantia === garantiaFilter;
      return matchesSearch && matchesGarantia;
    });
  }, [hojas, searchQuery, garantiaFilter]);

  return (
    <div className="space-y-5">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <span>Hoja Oficial de Servicio (LGEMS / Multimarca)</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Módulo 5
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (hojas.length > 0) {
                ExportService.exportToPdf('hoja_servicio', hojas[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-rose-500 font-black text-[10px]">PDF</span>
            <span>Exportar</span>
          </button>
          <button
            onClick={() => ExportService.exportModuleListToExcel('hoja_servicio')}
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
            <span>Nueva Hoja de Servicio</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por folio LGEMS, cliente, modelo, serie o técnico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filtrar Garantía:</span>
          <select
            value={garantiaFilter}
            onChange={(e) => setGarantiaFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">Todas</option>
            <option value="Sí">En Garantía (Sí)</option>
            <option value="No">Fuera de Garantía (No)</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Folio LGEMS / Recepción</th>
                <th className="p-3.5">Cliente / Ciudad</th>
                <th className="p-3.5">Producto & Modelo</th>
                <th className="p-3.5">Garantía / Tipo</th>
                <th className="p-3.5">Técnico Asignado</th>
                <th className="p-3.5 text-right">Total Liquidado</th>
                <th className="p-3.5 text-center">Firmas</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-rose-700 font-mono block">{item.folioLGEMS}</span>
                      <span className="text-[11px] text-slate-400">{item.fechaRecepcion}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-900 block">{item.nombreCompleto}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-xs">{item.ciudad}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium block">{item.tipoProducto}</span>
                      <span className="text-[11px] text-slate-500">Mod: {item.modelo}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.garantia === 'Sí'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          Garantía: {item.garantia}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.tipoServicio}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium">{item.tecnicoAsignado}</span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        item.firmaClienteDataUrl || item.firmaTecnicoDataUrl
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {item.firmaClienteDataUrl && item.firmaTecnicoDataUrl
                          ? 'Ambas Firmas'
                          : item.firmaClienteDataUrl
                          ? 'Firma Cliente'
                          : item.firmaTecnicoDataUrl
                          ? 'Firma Técnico'
                          : 'Sin Firmar'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setPreviewRecord(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Ver Formato Oficial / Imprimir"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => ExportService.exportToPdf('hoja_servicio', item)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Descargar PDF Oficial"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => ExportService.exportRecordToExcel('hoja_servicio', item)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Descargar Excel con 2 Hojas (Detalle + Refacciones)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
                    No se encontraron hojas de servicio con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
            <div className="px-6 py-4 bg-rose-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingItem ? 'Editar Hoja de Servicio' : 'Nueva Hoja de Servicio Oficial (LGEMS)'}
                </h3>
                <p className="text-xs text-rose-100">Reporte técnico integral con validaciones, refacciones y firmas</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-rose-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* 1. Control y Encabezado */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Control y Encabezado
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">No. Orden / Folio LGEMS</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.folioLGEMS}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-rose-800 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Centro de Servicio Autorizado</label>
                    <input
                      type="text"
                      value={formData.centroServicioAutorizado}
                      onChange={(e) => setFormData({ ...formData, centroServicioAutorizado: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tipo de Servicio</label>
                    <select
                      value={formData.tipoServicio}
                      onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      {TIPO_SERVICIO_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Garantía (Sí / No)</label>
                    <select
                      value={formData.garantia}
                      onChange={(e) => setFormData({ ...formData, garantia: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Sí">Sí (Garantía)</option>
                      <option value="No">No (Con Cargo)</option>
                    </select>
                  </div>
                </div>

                {/* Fechas Clave */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">F. Recepción</label>
                    <input
                      type="date"
                      value={formData.fechaRecepcion}
                      onChange={(e) => setFormData({ ...formData, fechaRecepcion: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">F. Requerida</label>
                    <input
                      type="date"
                      value={formData.fechaRequerida}
                      onChange={(e) => setFormData({ ...formData, fechaRequerida: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">F. Inicio Atención</label>
                    <input
                      type="date"
                      value={formData.fechaInicioAtencion}
                      onChange={(e) => setFormData({ ...formData, fechaInicioAtencion: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">F. Fin Atención</label>
                    <input
                      type="date"
                      value={formData.fechaFinAtencion}
                      onChange={(e) => setFormData({ ...formData, fechaFinAtencion: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">F. Entrega</label>
                    <input
                      type="date"
                      value={formData.fechaEntrega}
                      onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Datos del Cliente */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">
                      Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del cliente o titular"
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value, nombreClienteFirma: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Domicilio Completo</label>
                    <input
                      type="text"
                      placeholder="Calle y número exterior/interior"
                      value={formData.domicilioCompleto}
                      onChange={(e) => setFormData({ ...formData, domicilioCompleto: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Colonia</label>
                    <input
                      type="text"
                      placeholder="Colonia"
                      value={formData.colonia}
                      onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ciudad</label>
                    <input
                      type="text"
                      placeholder="Ciudad / Alcaldía"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Estado</label>
                    <input
                      type="text"
                      placeholder="Estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">C.P.</label>
                    <input
                      type="text"
                      placeholder="03230"
                      value={formData.codigoPostal}
                      onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Teléfono Fijo (Numérico)</label>
                    <input
                      type="tel"
                      placeholder="5555208833"
                      value={formData.telefonoFijo}
                      onChange={(e) => setFormData({ ...formData, telefonoFijo: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Celular (Numérico)</label>
                    <input
                      type="tel"
                      placeholder="5554019922"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Datos del Producto y Falla */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Datos del Producto y Falla
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tipo de Producto</label>
                    <select
                      value={formData.tipoProducto}
                      onChange={(e) => setFormData({ ...formData, tipoProducto: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      {APPLIANCE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Modelo</label>
                    <input
                      type="text"
                      placeholder="Ej. LM89SXD"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">No. de Serie</label>
                    <input
                      type="text"
                      placeholder="Ej. LG-STUDIO-8829"
                      value={formData.numeroSerie}
                      onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Distribuidor</label>
                    <input
                      type="text"
                      placeholder="Ej. El Palacio de Hierro"
                      value={formData.distribuidor}
                      onChange={(e) => setFormData({ ...formData, distribuidor: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Fecha de Compra</label>
                    <input
                      type="date"
                      value={formData.fechaCompra}
                      onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Síntoma / Falla reportada</label>
                    <textarea
                      rows={2}
                      placeholder="Descripción de la falla reportada por el cliente..."
                      value={formData.sintomaFallaReportada}
                      onChange={(e) => setFormData({ ...formData, sintomaFallaReportada: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Observaciones del Servicio / Diagnóstico
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Procedimiento realizado y diagnóstico del técnico..."
                      value={formData.observacionesDiagnostico}
                      onChange={(e) => setFormData({ ...formData, observacionesDiagnostico: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Validaciones Técnicas y Condiciones de Instalación */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. Validaciones Técnicas y Condiciones de Instalación</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">¿Hay tierra física?</label>
                    <select
                      value={formData.hayTierraFisica}
                      onChange={(e) => setFormData({ ...formData, hayTierraFisica: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                      <option value="No verificable">No verificable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Voltaje domicilio (V)</label>
                    <input
                      type="text"
                      placeholder="Ej. 122 VAC"
                      value={formData.voltajeDomicilio}
                      onChange={(e) => setFormData({ ...formData, voltajeDomicilio: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Presión de agua (PSI)</label>
                    <input
                      type="text"
                      placeholder="Ej. 35 PSI"
                      value={formData.presionAguaPSI}
                      onChange={(e) => setFormData({ ...formData, presionAguaPSI: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Presión de gas (inH2O / PSI)</label>
                    <input
                      type="text"
                      placeholder="Ej. 11 inH2O / N/A"
                      value={formData.presionGas}
                      onChange={(e) => setFormData({ ...formData, presionGas: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Checklist Condición Física */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-slate-700 font-bold mb-2">
                    Condición física inicial del equipo (Checklist de estado):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.condicionesFisicas?.golpesRayones || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condicionesFisicas: {
                              ...formData.condicionesFisicas!,
                              golpesRayones: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Golpes / Rayones</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.condicionesFisicas?.faltanTornillos || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condicionesFisicas: {
                              ...formData.condicionesFisicas!,
                              faltanTornillos: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Faltan tornillos / piezas</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.condicionesFisicas?.intervenidoTerceros || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condicionesFisicas: {
                              ...formData.condicionesFisicas!,
                              intervenidoTerceros: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Intervenido por terceros</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.condicionesFisicas?.humedadOxido || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condicionesFisicas: {
                              ...formData.condicionesFisicas!,
                              humedadOxido: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Humedad / Óxido</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.condicionesFisicas?.cablesDañados || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condicionesFisicas: {
                              ...formData.condicionesFisicas!,
                              cablesDañados: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Cables o clavija dañados</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.condicionesFisicas?.limpioYCompleto || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condicionesFisicas: {
                              ...formData.condicionesFisicas!,
                              limpioYCompleto: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-emerald-700">Limpio y completo</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Técnico Asignado</label>
                    <select
                      value={formData.tecnicoAsignado}
                      onChange={(e) => setFormData({ ...formData, tecnicoAsignado: e.target.value, nombreTecnico: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      {STAFF_LIST.map((staff) => (
                        <option key={staff} value={staff}>
                          {staff}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Fecha de Confirmación / Visita</label>
                    <input
                      type="date"
                      value={formData.fechaConfirmacionVisita}
                      onChange={(e) => setFormData({ ...formData, fechaConfirmacionVisita: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Tabla de Refacciones Utilizadas */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    5. Tabla de Refacciones Utilizadas (Grid Dinámico)
                  </h4>
                  <button
                    type="button"
                    onClick={addRefaccionRow}
                    className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Agregar Refacción</span>
                  </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2 w-32">No. de Parte</th>
                        <th className="p-2">Descripción</th>
                        <th className="p-2 w-20 text-center">Cantidad</th>
                        <th className="p-2 w-28 text-right">Monto Unit. ($)</th>
                        <th className="p-2 w-28 text-right">Subtotal</th>
                        <th className="p-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.refacciones && formData.refacciones.length > 0 ? (
                        formData.refacciones.map((ref, idx) => (
                          <tr key={ref.id || idx}>
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="AEQ731102"
                                value={ref.numeroParte}
                                onChange={(e) => handleRefaccionChange(idx, 'numeroParte', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-xs focus:ring-1 focus:ring-rose-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Descripción de la pieza..."
                                value={ref.descripcion}
                                onChange={(e) => handleRefaccionChange(idx, 'descripcion', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-rose-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={ref.cantidad}
                                onChange={(e) => handleRefaccionChange(idx, 'cantidad', parseInt(e.target.value) || 1)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center text-xs focus:ring-1 focus:ring-rose-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={ref.monto || ''}
                                onChange={(e) => handleRefaccionChange(idx, 'monto', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right text-xs font-semibold focus:ring-1 focus:ring-rose-500"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-slate-800">
                              {formatCurrency((ref.cantidad || 1) * (ref.monto || 0))}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeRefaccionRow(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Quitar fila"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-3 text-center text-slate-400">
                            No hay refacciones agregadas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Liquidación y Encuesta al Cliente */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-rose-600" />
                  <span>6. Liquidación Financiera y Encuesta</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Mano de Obra ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.manoDeObra || ''}
                      onChange={(e) => handleFinancialChange('manoDeObra', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Transporte ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.transporte || ''}
                      onChange={(e) => handleFinancialChange('transporte', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Visita ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.visita || ''}
                      onChange={(e) => handleFinancialChange('visita', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Materiales ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.materiales || ''}
                      onChange={(e) => handleFinancialChange('materiales', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Repuestos ($ Calculado)</label>
                    <input
                      type="text"
                      readOnly
                      value={formatCurrency(formData.repuestosMonto)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">IVA (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.ivaPorcentaje ?? 16}
                      onChange={(e) => handleFinancialChange('ivaPorcentaje', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">IVA ($ Calculado)</label>
                    <input
                      type="text"
                      readOnly
                      value={formatCurrency(formData.ivaMonto)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-900">TOTAL CALCULADO:</span>
                    <span className="text-base font-bold text-rose-700 font-mono">
                      {formatCurrency(formData.total)}
                    </span>
                  </div>
                </div>

                {/* Validación de Cobro y Garantía */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">¿Realizó algún pago?</label>
                    <select
                      value={formData.realizoPago}
                      onChange={(e) => setFormData({ ...formData, realizoPago: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Cantidad Pagada ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cantidadPagada || ''}
                      onChange={(e) => setFormData({ ...formData, cantidadPagada: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Motivo de Pago</label>
                    <select
                      value={formData.motivoPago}
                      onChange={(e) => setFormData({ ...formData, motivoPago: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      {MOTIVO_PAGO_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Validación de Garantía</label>
                    <select
                      value={formData.validacionGarantia}
                      onChange={(e) => setFormData({ ...formData, validacionGarantia: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
                    >
                      {VALIDACION_GARANTIA_OPTIONS.map((vg) => (
                        <option key={vg} value={vg}>
                          {vg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 7. Firmas Digitales / Captura de Firma */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>7. Firmas Digitales / Captura de Firma en Pantalla</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Firma Técnico */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nombre del Técnico</label>
                      <input
                        type="text"
                        value={formData.nombreTecnico}
                        onChange={(e) => setFormData({ ...formData, nombreTecnico: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <SignaturePad
                      label="Firma Digital del Técnico"
                      initialDataUrl={formData.firmaTecnicoDataUrl}
                      signerName={formData.nombreTecnico}
                      onSave={(dataUrl) => setFormData((prev) => ({ ...prev, firmaTecnicoDataUrl: dataUrl }))}
                    />
                  </div>

                  {/* Firma Cliente */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nombre del Cliente / Receptor</label>
                      <input
                        type="text"
                        value={formData.nombreClienteFirma}
                        onChange={(e) => setFormData({ ...formData, nombreClienteFirma: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <SignaturePad
                      label="Firma de Conformidad del Cliente"
                      initialDataUrl={formData.firmaClienteDataUrl}
                      signerName={formData.nombreClienteFirma}
                      onSave={(dataUrl) => setFormData((prev) => ({ ...prev, firmaClienteDataUrl: dataUrl }))}
                    />
                  </div>
                </div>
              </div>

              {/* 8. Evidencias Fotográficas */}
              <EvidencePhotoManager
                photos={formData.evidencias || []}
                onChange={(photos) => setFormData((prev) => ({ ...prev, evidencias: photos }))}
                title="8. Evidencias Fotográficas de Servicio y Diagnóstico"
                subtitle="Captura fotos con la cámara o sube imágenes del equipo, número de serie, partes dañadas y firma"
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Hoja de Servicio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Format Print / Preview Modal */}
      {previewRecord && (
        <FormatPrintPreview
          module="hoja_servicio"
          record={previewRecord}
          company={company}
          isOpen={Boolean(previewRecord)}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </div>
  );
};
