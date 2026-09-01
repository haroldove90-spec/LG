import React, { useState, useEffect } from 'react';
import {
  BookUser,
  CalendarCheck,
  FileCheck,
  Building2,
  Settings,
  RefreshCw,
  X,
  Save,
  Menu,
  Shield,
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { ModuleType, CompanyInfo } from './types';
import { StorageService } from './lib/storage';
import { AgendaModule } from './components/AgendaModule';
import { ReporteSitioModule } from './components/ReporteSitioModule';
import { CotizacionModule } from './components/CotizacionModule';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('agenda');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => StorageService.getCompanyInfo());
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [tempCompany, setTempCompany] = useState<CompanyInfo>(companyInfo);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // PWA Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'desktop'>('desktop');

  const [stats, setStats] = useState({
    agendaCount: 0,
    reportesCount: 0,
    cotizacionesCount: 0,
  });

  const refreshCounters = () => {
    setStats({
      agendaCount: StorageService.getAgenda().length,
      reportesCount: StorageService.getReportesSitio().length,
      cotizacionesCount: StorageService.getCotizaciones().length,
    });
  };

  useEffect(() => {
    refreshCounters();
  }, [activeModule]);

  // PWA detection and beforeinstallprompt listener
  useEffect(() => {
    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceOS('ios');
    } else if (/android/i.test(userAgent)) {
      setDeviceOS('android');
    } else {
      setDeviceOS('desktop');
    }

    // Check if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error invoking install prompt:', err);
        setIsInstallModalOpen(true);
      }
    } else {
      // Show instructional modal if no native prompt is queued
      setIsInstallModalOpen(true);
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveCompanyInfo(tempCompany);
    setCompanyInfo(tempCompany);
    setIsCompanyModalOpen(false);
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        '¿Desea restaurar los datos de ejemplo iniciales de Electro Industrias? Se sobrescribirán los cambios no guardados.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Módulos activos solicitados
  const modules = [
    {
      id: 'agenda' as ModuleType,
      number: '1',
      title: 'Agenda',
      subtitle: 'Contactos y Programas',
      icon: BookUser,
      count: stats.agendaCount,
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
      id: 'cotizacion' as ModuleType,
      number: '3',
      title: 'Cotizaciones',
      subtitle: 'Refacciones & Pedidos',
      icon: FileCheck,
      count: stats.cotizacionesCount,
    },
  ];

  const currentModuleObj = modules.find((m) => m.id === activeModule) || modules[0];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Bento Grid Left Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-base font-black shadow-sm ring-2 ring-blue-100">
              <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase truncate">
                Electro Industrias
              </h1>
              <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold">
                Servicio Técnico & PWA
              </p>
            </div>
          </div>
          {companyInfo.authorizedCenter && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 uppercase">
              <Shield className="w-3 h-3 text-blue-600" />
              <span className="truncate max-w-[190px]">{companyInfo.authorizedCenter}</span>
            </div>
          )}
        </div>

        {/* Navigation Modules (Bento style items) */}
        <nav className="flex-1 p-3.5 space-y-1.5">
          <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Módulos Principales
          </p>
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isActive ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  />
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <span className="text-xs block truncate">{mod.title}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {mod.count}
                </span>
              </button>
            );
          })}

          {/* Tarjeta de Instalación PWA en Sidebar */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-100/80 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Aplicación Móvil PWA</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Instala Electro Industrias en tu teléfono o computadora para acceso rápido.
              </p>
              <button
                type="button"
                onClick={handleInstallApp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalled ? 'App Instalada' : 'Instalar App'}</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Bottom Technician & Settings Profile Tile */}
        <div className="p-3.5 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                EI
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">Electro Industrias</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Control de Servicio</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTempCompany(companyInfo);
                setIsCompanyModalOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Configuración de la Empresa"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <button
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reiniciar Datos</span>
            </button>
            <span>v3.0 PWA</span>
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
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-800 leading-tight">
                  {currentModuleObj.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {currentModuleObj.subtitle}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-blue-100">
              Módulo #{currentModuleObj.number}
            </span>
          </div>

          {/* Quick System Tools Header Action + BOTÓN DE INSTALAR APP */}
          <div className="flex items-center gap-2">
            {/* BOTÓN INSTALAR PWA */}
            <button
              type="button"
              onClick={handleInstallApp}
              id="btn-instalar-app-header"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ring-2 ring-blue-200/50"
              title="Instalar Electro Industrias en tu teléfono móvil o computadora"
            >
              <Download className="w-3.5 h-3.5 text-blue-100 animate-bounce" />
              <span>Instalar App</span>
            </button>

            <button
              onClick={() => {
                setTempCompany(companyInfo);
                setIsCompanyModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Configuración</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Centro Especializado</span>
              <span className="text-xs font-semibold text-slate-700">Electro Industrias</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Módulos de Servicio
              </span>
              <button
                type="button"
                onClick={handleInstallApp}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
              >
                <Download className="w-3 h-3" />
                <span>Instalar PWA</span>
              </button>
            </div>
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    />
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium">{mod.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {mod.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'agenda' && (
            <AgendaModule company={companyInfo} />
          )}
          {activeModule === 'reporte_sitio' && (
            <ReporteSitioModule company={companyInfo} />
          )}
          {activeModule === 'cotizacion' && (
            <CotizacionModule company={companyInfo} />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>
              <strong className="text-slate-700">Electro Industrias</strong> • {companyInfo.address} • Tel: {companyInfo.phone}
            </p>
            <p className="text-[11px] text-slate-400">
              Electro Industrias PWA • Agenda, Citas y Cotizaciones
            </p>
          </div>
        </footer>
      </div>

      {/* PWA INSTALLATION INSTRUCTIONAL MODAL */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Instalar Electro Industrias</h3>
                  <p className="text-[11px] text-blue-100">Aplicación Móvil y de Escritorio (PWA)</p>
                </div>
              </div>
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Electro Industrias</p>
                  <p className="text-[11px] text-slate-500">Acceso rápido, modo pantalla completa y rendimiento optimizado.</p>
                </div>
              </div>

              {/* Guía según dispositivo */}
              {deviceOS === 'android' && (
                <div className="space-y-2.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">1</span>
                    En Google Chrome / Dispositivo Android:
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-[11px] leading-relaxed">
                    <p>1. Toca el menú de <strong>tres puntos (⋮)</strong> en la esquina superior derecha del navegador.</p>
                    <p>2. Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</p>
                    <p>3. Pulsa <strong>"Instalar"</strong> para tener el acceso directo con ícono oficial.</p>
                  </div>
                </div>
              )}

              {deviceOS === 'ios' && (
                <div className="space-y-2.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">1</span>
                    En iPhone / iPad (Safari):
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-[11px] leading-relaxed">
                    <p className="flex items-center gap-1.5">
                      1. Toca el botón <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> en la barra inferior de Safari.
                    </p>
                    <p className="flex items-center gap-1.5">
                      2. Desplázate hacia abajo y selecciona <strong>"Agregar al inicio"</strong> <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />.
                    </p>
                    <p>3. Toca <strong>"Agregar"</strong> en la esquina superior derecha.</p>
                  </div>
                </div>
              )}

              {deviceOS === 'desktop' && (
                <div className="space-y-2.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">1</span>
                    En Computadora (Chrome / Edge / Opera):
                  </p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-[11px] leading-relaxed">
                    <p>1. Busca el ícono de <strong>Instalar (⊕ o Computadora con flecha)</strong> al final de la barra de direcciones URL.</p>
                    <p>2. Haz clic en <strong>"Instalar Electro Industrias"</strong>.</p>
                    <p>3. Se abrirá como una aplicación independiente en tu escritorio.</p>
                  </div>
                </div>
              )}

              {/* Botón de cierre / confirmación */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPANY CONFIGURATION MODAL (Bento Grid Style) */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Configuración de Electro Industrias
                </h3>
                <p className="text-xs text-blue-100 opacity-90">
                  Datos membretados para reportes, cotizaciones y exportaciones
                </p>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
                  <label className="block text-slate-600 font-semibold mb-1">Nombre Comercial del Centro</label>
                  <input
                    type="text"
                    required
                    value={tempCompany.name}
                    onChange={(e) => setTempCompany({ ...tempCompany, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">RFC / Identificación</label>
                    <input
                      type="text"
                      value={tempCompany.rfc}
                      onChange={(e) => setTempCompany({ ...tempCompany, rfc: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Centro Especializado</label>
                    <input
                      type="text"
                      value={tempCompany.authorizedCenter}
                      onChange={(e) => setTempCompany({ ...tempCompany, authorizedCenter: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Teléfono Principal</label>
                    <input
                      type="text"
                      value={tempCompany.phone}
                      onChange={(e) => setTempCompany({ ...tempCompany, phone: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={tempCompany.email}
                      onChange={(e) => setTempCompany({ ...tempCompany, email: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
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
