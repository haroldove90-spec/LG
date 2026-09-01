import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Wrench,
  Truck,
  FileSignature,
  Building2,
  Settings,
  RefreshCw,
  X,
  Save,
  Menu,
  Shield,
  BookUser,
  CalendarCheck,
} from 'lucide-react';
import { ModuleType, CompanyInfo } from './types';
import { StorageService } from './lib/storage';
import { MetricasModule } from './components/MetricasModule';
import { FolioSeguimientoModule } from './components/FolioSeguimientoModule';
import { CotizacionModule } from './components/CotizacionModule';
import { OrdenTallerModule } from './components/OrdenTallerModule';
import { ReporteSitioModule } from './components/ReporteSitioModule';
import { HojaServicioModule } from './components/HojaServicioModule';
import { AgendaModule } from './components/AgendaModule';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('agenda');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => StorageService.getCompanyInfo());
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [tempCompany, setTempCompany] = useState<CompanyInfo>(companyInfo);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    agendaCount: 0,
    foliosCount: 0,
    cotizacionesCount: 0,
    ordenesCount: 0,
    reportesCount: 0,
    hojasCount: 0,
  });

  const refreshCounters = () => {
    setStats({
      agendaCount: StorageService.getAgenda().length,
      foliosCount: StorageService.getFoliosSeguimiento().length,
      cotizacionesCount: StorageService.getCotizaciones().length,
      ordenesCount: StorageService.getOrdenesTaller().length,
      reportesCount: StorageService.getReportesSitio().length,
      hojasCount: StorageService.getHojasServicio().length,
    });
  };

  useEffect(() => {
    refreshCounters();
  }, [activeModule]);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveCompanyInfo(tempCompany);
    setCompanyInfo(tempCompany);
    setIsCompanyModalOpen(false);
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        '¿Desea restaurar los datos de ejemplo iniciales? Se sobrescribirán los cambios no guardados.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const modules = [
    {
      id: 'agenda' as ModuleType,
      number: '★',
      title: 'Agenda',
      subtitle: 'Contactos y Programas',
      icon: BookUser,
      count: stats.agendaCount,
    },
    {
      id: 'orden_taller' as ModuleType,
      number: '1',
      title: 'Orden de Taller',
      subtitle: 'Carry-In & Banco',
      icon: Wrench,
      count: stats.ordenesCount,
    },
    {
      id: 'reporte_sitio' as ModuleType,
      number: '2',
      title: 'Citas a Clientes (Reportes)',
      subtitle: 'Servicio en Sitio & Domicilio',
      icon: CalendarCheck,
      count: stats.reportesCount,
    },
    {
      id: 'folio_seguimiento' as ModuleType,
      number: '3',
      title: 'Folio Seguimiento',
      subtitle: 'Costeo & Anticipo 70%',
      icon: FileText,
      count: stats.foliosCount,
    },
    {
      id: 'cotizacion' as ModuleType,
      number: '4',
      title: 'Cotización Partes',
      subtitle: 'Refacciones & Pedidos',
      icon: FileCheck,
      count: stats.cotizacionesCount,
    },
    {
      id: 'hoja_servicio' as ModuleType,
      number: '5',
      title: 'Hoja de Servicio',
      subtitle: 'Oficial & Firmas',
      icon: FileSignature,
      count: stats.hojasCount,
    },
  ];

  const currentModuleObj = modules.find((m) => m.id === activeModule) || modules[0];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Bento Grid Left Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs">
              S
            </div>
            <div>
              <h1 className="text-base font-bold text-indigo-600 tracking-tight leading-tight">
                {companyInfo.name || 'SERVITECH'}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Panel de Administración
              </p>
            </div>
          </div>
          {companyInfo.authorizedCenter && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 uppercase">
              <Shield className="w-3 h-3 text-indigo-500" />
              <span className="truncate max-w-[190px]">{companyInfo.authorizedCenter}</span>
            </div>
          )}
        </div>

        {/* Navigation Modules (Bento style items) */}
        <nav className="flex-1 p-3.5 space-y-1.5">
          <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Módulos de Servicio
          </p>
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isActive ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  />
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <span className="text-xs block truncate">{mod.title}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {mod.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Technician & Settings Profile Tile */}
        <div className="p-3.5 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                JD
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">Juan Delgado</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Técnico Senior</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTempCompany(companyInfo);
                setIsCompanyModalOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
              title="Configuración de la Empresa"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <button
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reiniciar Demo</span>
            </button>
            <span>v2.5 Bento</span>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-800 leading-tight">
                  {currentModuleObj.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {currentModuleObj.subtitle}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-indigo-100">
              Módulo #{currentModuleObj.number}
            </span>
          </div>

          {/* Quick System Tools Header Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempCompany(companyInfo);
                setIsCompanyModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Configuración</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Centro de Servicio</span>
              <span className="text-xs font-semibold text-slate-700">{companyInfo.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Módulos de Servicio
            </p>
            {modules.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModule(mod.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    />
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs">{mod.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {mod.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Bento Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'agenda' && (
            <AgendaModule company={companyInfo} />
          )}
          {activeModule === 'metricas' && (
            <MetricasModule
              company={companyInfo}
              onNavigate={(mod) => {
                setActiveModule(mod);
                refreshCounters();
              }}
            />
          )}
          {activeModule === 'folio_seguimiento' && (
            <FolioSeguimientoModule company={companyInfo} />
          )}
          {activeModule === 'cotizacion' && (
            <CotizacionModule company={companyInfo} />
          )}
          {activeModule === 'orden_taller' && (
            <OrdenTallerModule company={companyInfo} />
          )}
          {activeModule === 'reporte_sitio' && (
            <ReporteSitioModule company={companyInfo} />
          )}
          {activeModule === 'hoja_servicio' && (
            <HojaServicioModule company={companyInfo} />
          )}
        </main>

        {/* Bento Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>
              <strong className="text-slate-700">{companyInfo.name}</strong> • {companyInfo.address} • Tel: {companyInfo.phone}
            </p>
            <p className="text-[11px] text-slate-400">
              ServiTrack Bento Grid • Exportación a PDF y Excel (.xlsx)
            </p>
          </div>
        </footer>
      </div>

      {/* COMPANY CONFIGURATION MODAL (Bento Grid Style) */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Configuración del Centro de Servicio
                </h3>
                <p className="text-xs text-indigo-100 opacity-90">
                  Datos membretados para reportes, folios y exportaciones
                </p>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Identidad Comercial
                </h4>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nombre Comercial del Taller</label>
                  <input
                    type="text"
                    required
                    value={tempCompany.name}
                    onChange={(e) => setTempCompany({ ...tempCompany, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">RFC / Identificación</label>
                    <input
                      type="text"
                      value={tempCompany.rfc}
                      onChange={(e) => setTempCompany({ ...tempCompany, rfc: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Centro Autorizado</label>
                    <input
                      type="text"
                      value={tempCompany.authorizedCenter}
                      onChange={(e) => setTempCompany({ ...tempCompany, authorizedCenter: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ubicación y Contacto
                </h4>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dirección Completa</label>
                  <input
                    type="text"
                    value={tempCompany.address}
                    onChange={(e) => setTempCompany({ ...tempCompany, address: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Teléfono Principal</label>
                    <input
                      type="text"
                      value={tempCompany.phone}
                      onChange={(e) => setTempCompany({ ...tempCompany, phone: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={tempCompany.email}
                      onChange={(e) => setTempCompany({ ...tempCompany, email: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
