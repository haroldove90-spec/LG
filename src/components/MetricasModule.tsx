import React, { useMemo } from 'react';
import {
  FileText,
  FileCheck,
  Wrench,
  Truck,
  FileSignature,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  FileDown,
  Layers,
  Activity,
  Users,
  Calendar,
  Check,
  Zap,
} from 'lucide-react';
import { ModuleType, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';

interface MetricasModuleProps {
  company: CompanyInfo;
  onNavigate: (module: ModuleType) => void;
}

const formatCurrency = (val: number | undefined): string => {
  if (val === undefined || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const MetricasModule: React.FC<MetricasModuleProps> = ({ company, onNavigate }) => {
  const folios = useMemo(() => StorageService.getFoliosSeguimiento(), []);
  const cotizaciones = useMemo(() => StorageService.getCotizaciones(), []);
  const ordenes = useMemo(() => StorageService.getOrdenesTaller(), []);
  const reportes = useMemo(() => StorageService.getReportesSitio(), []);
  const hojas = useMemo(() => StorageService.getHojasServicio(), []);

  // Global KPIs
  const totalServicios = folios.length + cotizaciones.length + ordenes.length + reportes.length + hojas.length;

  const totalReparacionesFolios = folios.reduce((acc, curr) => acc + (curr.reparacionTotal || 0), 0);
  const totalAnticiposFolios = folios.reduce((acc, curr) => acc + (curr.anticipoRequerido || 0), 0);
  const totalSaldosFolios = folios.reduce((acc, curr) => acc + (curr.restanReparacion || 0), 0);

  const totalRefaccionesCotizaciones = cotizaciones.reduce((acc, curr) => acc + (curr.costoTotalRefacciones || 0), 0);
  const totalPresupuestoOrdenes = ordenes.reduce((acc, curr) => acc + (curr.presupuesto || 0), 0);
  const totalPresupuestoReportes = reportes.reduce((acc, curr) => acc + (curr.presupuesto || 0), 0);
  const totalLiquidadoHojas = hojas.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalPagadoHojas = hojas.reduce((acc, curr) => acc + (curr.cantidadPagada || 0), 0);

  const granTotalCartera = totalReparacionesFolios + totalRefaccionesCotizaciones + totalPresupuestoOrdenes + totalPresupuestoReportes + totalLiquidadoHojas;

  // Active status counters
  const foliosActivos = folios.filter((f) => f.estatus !== 'Entregado / Cerrado' && f.estatus !== 'Cancelado').length;
  const ordenesEnTaller = ordenes.filter((o) => o.estatus === 'En Diagnóstico' || o.estatus === 'En Proceso' || o.estatus === 'En Espera de Refacciones').length;
  const reportesGarantia = reportes.filter((r) => r.tipoServicio === 'Garantía').length;
  const hojasConFirma = hojas.filter((h) => h.firmaClienteDataUrl && h.firmaTecnicoDataUrl).length;

  // Recent consolidated activity feed
  const recentActivity = useMemo(() => {
    const list: {
      id: string;
      moduleName: string;
      moduleId: ModuleType;
      moduleCode: string;
      codeColor: string;
      folioCode: string;
      client: string;
      date: string;
      amount: number;
      badgeText: string;
    }[] = [];

    folios.slice(0, 3).forEach((f) => {
      list.push({
        id: f.id,
        moduleName: 'Folio de Seguimiento',
        moduleId: 'folio_seguimiento',
        moduleCode: 'M1',
        codeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        folioCode: f.folio,
        client: f.cliente,
        date: f.fecha,
        amount: f.reparacionTotal || 0,
        badgeText: f.estatus,
      });
    });

    cotizaciones.slice(0, 2).forEach((c) => {
      list.push({
        id: c.id,
        moduleName: 'Cotización',
        moduleId: 'cotizacion',
        moduleCode: 'M2',
        codeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        folioCode: c.numeroCotizacion,
        client: c.cliente,
        date: c.fecha,
        amount: c.costoTotalRefacciones || 0,
        badgeText: c.estatus,
      });
    });

    ordenes.slice(0, 2).forEach((o) => {
      list.push({
        id: o.id,
        moduleName: 'Orden de Taller',
        moduleId: 'orden_taller',
        moduleCode: 'M3',
        codeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        folioCode: o.numeroOrden,
        client: o.cliente,
        date: o.fechaRecepcion,
        amount: o.presupuesto || 0,
        badgeText: o.estatus,
      });
    });

    reportes.slice(0, 2).forEach((r) => {
      list.push({
        id: r.id,
        moduleName: 'Reporte en Sitio',
        moduleId: 'reporte_sitio',
        moduleCode: 'M4',
        codeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        folioCode: r.numeroReporte,
        client: r.nombreCliente,
        date: r.fechaReporte,
        amount: r.presupuesto || 0,
        badgeText: r.tipoServicio,
      });
    });

    hojas.slice(0, 2).forEach((h) => {
      list.push({
        id: h.id,
        moduleName: 'Hoja de Servicio',
        moduleId: 'hoja_servicio',
        moduleCode: 'M5',
        codeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        folioCode: h.folioLGEMS,
        client: h.nombreCompleto,
        date: h.fechaRecepcion,
        amount: h.total || 0,
        badgeText: h.garantia === 'Sí' ? 'Garantía' : 'Particular',
      });
    });

    return list.slice(0, 8);
  }, [folios, cotizaciones, ordenes, reportes, hojas]);

  return (
    <div className="space-y-5">
      {/* Top Welcome & Master Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              HOME • PANEL MAESTRO
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Sincronización Operativa 360°
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Métricas de Rendimiento y Estado del Taller
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Consolidación integral de los 5 módulos: cotizaciones, diagnósticos, órdenes de banco, visitas en domicilio y liquidaciones con firma digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (folios.length > 0) ExportService.exportToPdf('folio_seguimiento', folios[0]);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-rose-500 font-black text-[11px]">PDF</span>
            <span>Muestra PDF</span>
          </button>
          <button
            onClick={() => ExportService.exportModuleListToExcel('folio_seguimiento')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="text-emerald-600 font-black text-[11px]">XLS</span>
            <span>Exportar Todo</span>
          </button>
          <button
            onClick={() => onNavigate('folio_seguimiento')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Folio</span>
          </button>
        </div>
      </div>

      {/* Global Top Bento Grid (4 Key Performance Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Servicios Totales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Servicios Activos
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-800">{totalServicios}</h3>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {foliosActivos} en proceso
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Taller Carry-In: <b>{ordenes.length}</b></span>
            <span>En Sitio: <b>{reportes.length}</b></span>
          </div>
        </div>

        {/* KPI 2: Cartera Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cartera Total Valuada
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(granTotalCartera)}</h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Acumulado
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cotizado: <b>{formatCurrency(totalReparacionesFolios)}</b></span>
            <span>Refacciones: <b>{formatCurrency(totalRefaccionesCotizaciones)}</b></span>
          </div>
        </div>

        {/* KPI 3: Anticipos 70% Requeridos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Anticipos 70% Requeridos
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-indigo-600">{formatCurrency(totalAnticiposFolios)}</h3>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Por Cobrar
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Saldos restantes: <b>{formatCurrency(totalSaldosFolios)}</b></span>
          </div>
        </div>

        {/* KPI 4: Liquidaciones & Firmas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Liquidado & Certificado
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalPagadoHojas)}</h3>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              {hojasConFirma} Firmadas
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hojas oficiales: <b>{hojas.length}</b></span>
            <span>Garantías: <b>{reportesGarantia}</b></span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Detalle Específico de Cada Módulo (5 Columns / Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Desglose de Rendimiento por Módulo
          </h3>
          <span className="text-xs text-indigo-600 font-semibold">
            Haz clic en cualquier tarjeta para abrir el módulo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Módulo 1: Folio de Seguimiento */}
          <div
            onClick={() => onNavigate('folio_seguimiento')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Módulo 1: Folios de Seguimiento
                    </h4>
                    <span className="text-[10px] text-slate-400">Diagnóstico, 70% anticipo y costeo</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {folios.length}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mano de Obra & Reparaciones</span>
                  <span className="font-bold text-slate-800">{formatCurrency(totalReparacionesFolios)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Anticipos Requeridos (70%)</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(totalAnticiposFolios)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Saldos por Liquidar</span>
                  <span className="font-bold text-amber-600">{formatCurrency(totalSaldosFolios)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Activos en Taller</span>
                  <span className="font-bold text-slate-700">{foliosActivos} de {folios.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-indigo-600 text-xs font-semibold">
              <span>Gestionar Folios</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Módulo 2: Cotización de Refacciones */}
          <div
            onClick={() => onNavigate('cotizacion')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Módulo 2: Cotizaciones de Partes
                    </h4>
                    <span className="text-[10px] text-slate-400">No. de parte, proveedor y pedidos</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {cotizaciones.length}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Monto Total de Refacciones</span>
                  <span className="font-bold text-slate-800">{formatCurrency(totalRefaccionesCotizaciones)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Piezas Cotizadas</span>
                  <span className="font-bold text-blue-600">
                    {cotizaciones.reduce((acc, c) => acc + (c.piezas || 1), 0)} unidades
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Política de Garantía Eléctrica</span>
                  <span className="font-bold text-slate-700">Aplicada</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Pedidos Registrados</span>
                  <span className="font-bold text-slate-700">{cotizaciones.length} pedidos</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-600 text-xs font-semibold">
              <span>Gestionar Cotizaciones</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Módulo 3: Órdenes de Taller */}
          <div
            onClick={() => onNavigate('orden_taller')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                      Módulo 3: Órdenes de Taller (Carry-In)
                    </h4>
                    <span className="text-[10px] text-slate-400">Recepción física, accesorios y banco</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  {ordenes.length}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Equipos en Banco de Taller</span>
                  <span className="font-bold text-amber-600">{ordenesEnTaller} activos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Presupuestos de Taller</span>
                  <span className="font-bold text-slate-800">{formatCurrency(totalPresupuestoOrdenes)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Inspección de Gabinete</span>
                  <span className="font-bold text-slate-700">100% Verificado</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Modalidad</span>
                  <span className="font-bold text-slate-700">Taller Central</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-amber-600 text-xs font-semibold">
              <span>Gestionar Órdenes Taller</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Módulo 4: Reporte de Servicio en Sitio */}
          <div
            onClick={() => onNavigate('reporte_sitio')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      Módulo 4: Servicio en Sitio (In-Home)
                    </h4>
                    <span className="text-[10px] text-slate-400">Rutas, técnicos y bitácora de visitas</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {reportes.length}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Presupuestado en Sitio</span>
                  <span className="font-bold text-slate-800">{formatCurrency(totalPresupuestoReportes)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Servicios en Garantía</span>
                  <span className="font-bold text-emerald-600">{reportesGarantia} (Sin cargo)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Técnicos Asignados en Ruta</span>
                  <span className="font-bold text-slate-700">3 técnicos activos</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Bitácora Progresiva</span>
                  <span className="font-bold text-slate-700">1ª, 2ª y 3ª visita</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-600 text-xs font-semibold">
              <span>Gestionar Servicios en Sitio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Módulo 5: Hoja Oficial de Servicio */}
          <div
            onClick={() => onNavigate('hoja_servicio')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between md:col-span-2 lg:col-span-2"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <FileSignature className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      Módulo 5: Hoja Oficial de Servicio & Liquidación
                    </h4>
                    <span className="text-[10px] text-slate-400">Validaciones de voltaje/gas/agua, firmas de cliente y comprobante</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  {hojas.length} Hojas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Total Liquidado</span>
                  <span className="font-black text-base text-slate-800">{formatCurrency(totalLiquidadoHojas)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Cobros Registrados</span>
                  <span className="font-black text-base text-rose-600">{formatCurrency(totalPagadoHojas)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Firmas Digitales</span>
                  <span className="font-black text-base text-emerald-600">{hojasConFirma} Completas</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-rose-600 text-xs font-semibold">
              <span>Gestionar Hojas Oficiales</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Flujo de Trabajo Operativo Integral (Visual Guide) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Flujo de Trabajo Operativo y Entrelazado de Módulos</span>
            </h3>
            <p className="text-xs text-slate-500">
              Así se conectan las órdenes en el ciclo de vida del servicio técnico de principio a fin.
            </p>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase">
            Guía de Procedimiento
          </span>
        </div>

        {/* 4 Steps Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Paso 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Paso 1
                </span>
                <span className="text-[10px] font-bold text-slate-400">Módulo 3 o 4</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Recepción & Triage</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Si el cliente acude al taller se genera <b>Orden de Taller (M3)</b>. Si es visita a domicilio, se abre <b>Reporte en Sitio (M4)</b> con hora y técnico.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-indigo-600 font-semibold">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Registro de falla e inspección</span>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Paso 2
                </span>
                <span className="text-[10px] font-bold text-slate-400">Módulo 1</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Diagnóstico y 70% Anticipo</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Se emite el <b>Folio de Seguimiento (M1)</b>. Se desglosa mano de obra, revisión y se calcula automáticamente el <b>70% de anticipo</b> requerido.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-indigo-600 font-semibold">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Aprobación y estatus operativo</span>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Paso 3
                </span>
                <span className="text-[10px] font-bold text-slate-400">Módulo 2</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Suministro de Refacciones</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Si requiere partes especiales bajo pedido, se genera la <b>Cotización (M2)</b> con número de parte, pedido a planta y política de partes eléctricas.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-indigo-600 font-semibold">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Abastecimiento a tiempo</span>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Paso 4
                </span>
                <span className="text-[10px] font-bold text-slate-400">Módulo 5</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Cierre Oficial & Firmas</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Se valida suministro de voltaje/gas/agua, se cargan refacciones finales, se liquidan saldos y se capturan <b>firmas digitales en pantalla</b>.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-indigo-600 font-semibold">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Entrega y garantía oficial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">
              Actividad Reciente en Todos los Módulos
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Últimos registros en tiempo real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Módulo</th>
                <th className="p-3.5">Folio / Código</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Estatus / Modalidad</th>
                <th className="p-3.5 text-right">Importe</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentActivity.map((item) => (
                <tr key={`${item.moduleId}-${item.id}`} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${item.codeColor}`}>
                      <span>{item.moduleCode}</span>
                      <span className="font-medium text-slate-600">• {item.moduleName}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-indigo-600">
                    {item.folioCode}
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">
                    {item.client}
                  </td>
                  <td className="p-3.5 text-slate-500 text-[11px]">
                    {item.date}
                  </td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {item.badgeText}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-800">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onNavigate(item.moduleId)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-200"
                    >
                      Abrir Módulo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
