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
import { OrdenTallerModule } from './components/OrdenTallerModule';
import { Wrench } from 'lucide-react';

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
    ordenesCount: 0,
  });

  const refreshCounters = () => {
    setStats({
      agendaCount: StorageService.getAgenda().length,
      reportesCount: StorageService.getReportesSitio().length,
      cotizacionesCount: StorageService.getCotizaciones().length,
      ordenesCount: StorageService.getOrdenesTaller().length,
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
    {
      id: 'orden_taller' as ModuleType,
      number: '4',
      title: 'Órdenes de Taller (Sin garantía)',
      subtitle: 'Recepción, Diagnóstico & Presupuesto',
      icon: Wrench,
      count: stats.ordenesCount,
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-hamburger-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer ${
                isMobileMenuOpen
                  ? 'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-100'
                  : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
              aria-label="Abrir o cerrar menú de navegación"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-blue-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <div className="min-w-0">
                <h2 className="font-bold text-xs sm:text-base text-slate-800 leading-tight truncate">
                  {currentModuleObj.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block truncate">
                  {currentModuleObj.subtitle}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-blue-100 shrink-0">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ring-2 ring-blue-200/50"
              title="Instalar Electro Industrias en tu teléfono móvil o computadora"
            >
              <Download className="w-3.5 h-3.5 text-blue-100" />
              <span className="hidden xs:inline">Instalar</span> App
            </button>

            <button
              onClick={() => {
                setTempCompany(companyInfo);
                setIsCompanyModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Configuración de la Empresa"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Configuración</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Centro Especializado</span>
              <span className="text-xs font-semibold text-slate-700">Electro Industrias</span>
            </div>
          </div>
        </header>

        {/* Quick Module Switcher Pill Bar for Mobile & Tablets (Always visible below header) */}
        <div className="lg:hidden bg-slate-100/90 border-b border-slate-200 px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 sticky top-16 z-15 backdrop-blur-xs">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setActiveModule(mod.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span className="whitespace-nowrap">
                  #{mod.number} {mod.id === 'orden_taller' ? 'Órdenes Taller' : mod.title.split(' ')[0]}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {mod.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Full Slide-Over Navigation Drawer for Mobile and Tablets */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide Drawer Panel */}
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 border-r border-slate-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      Electro Industrias
                    </h2>
                    <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">
                      Servicio Técnico & PWA
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer border border-slate-200/60"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation List */}
              <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Módulos del Sistema (1 al 4)
                </p>
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        setActiveModule(mod.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 border border-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isActive ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-300'
                          }`}
                        />
                        <div className="p-1.5 rounded-lg bg-blue-50/80 text-blue-600 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block text-slate-900 truncate">
                            #{mod.number}. {mod.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {mod.subtitle}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        {mod.count}
                      </span>
                    </button>
                  );
                })}

                {/* PWA Direct Installation Card */}
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Instalar en Teléfono / Tablet</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Accede sin conexión y gestiona órdenes de taller al instante.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleInstallApp();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isInstalled ? 'App Instalada' : 'Instalar Aplicación'}</span>
                    </button>
                  </div>
                </div>
              </nav>

              {/* Drawer Footer Actions */}
              <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTempCompany(companyInfo);
                    setIsCompanyModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Configuración de Empresa</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Editar</span>
                </button>

                <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleResetDemoData();
                    }}
                    className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restaurar Datos</span>
                  </button>
                  <span>v3.0 PWA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {activeModule === 'agenda' && (
            <AgendaModule company={companyInfo} />
          )}
          {activeModule === 'reporte_sitio' && (
            <ReporteSitioModule company={companyInfo} />
          )}
          {activeModule === 'cotizacion' && (
            <CotizacionModule company={companyInfo} />
          )}
          {activeModule === 'orden_taller' && (
            <OrdenTallerModule company={companyInfo} />
          )}
        </main>

        {/* Fixed Bottom Dock Navigation Bar for Mobile and Tablets */}
        <nav
          aria-label="Navegación Móvil Rápida"
          className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setActiveModule(mod.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-blue-600 font-bold bg-blue-50/80'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400'}`} />
                  {mod.count > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 text-[9px] font-black min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {mod.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-tight tracking-tight text-center truncate max-w-[72px]">
                  {mod.id === 'agenda' && 'Agenda'}
                  {mod.id === 'reporte_sitio' && 'Citas Sitio'}
                  {mod.id === 'cotizacion' && 'Cotizaciones'}
                  {mod.id === 'orden_taller' && 'Órdenes'}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 mt-auto hidden lg:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>
              <strong className="text-slate-700">Electro Industrias</strong> • {companyInfo.address} • Tel: {companyInfo.phone}
            </p>
            <p className="text-[11px] text-slate-400">
              Electro Industrias PWA • Agenda, Citas, Cotizaciones y Órdenes de Taller
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
