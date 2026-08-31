import {
  FolioSeguimiento,
  Cotizacion,
  OrdenTaller,
  ReporteSitio,
  HojaServicio,
  CompanyInfo,
  ModuleType,
} from '../types';
import {
  DEFAULT_COMPANY,
  INITIAL_FOLIOS,
  INITIAL_COTIZACIONES,
  INITIAL_ORDENES_TALLER,
  INITIAL_REPORTES_SITIO,
  INITIAL_HOJAS_SERVICIO,
} from '../data/initialData';

const KEYS = {
  COMPANY: 'servitrack_company',
  FOLIOS: 'servitrack_folios',
  COTIZACIONES: 'servitrack_cotizaciones',
  ORDENES: 'servitrack_ordenes',
  REPORTES: 'servitrack_reportes',
  HOJAS: 'servitrack_hojas',
};

export const StorageService = {
  // Company
  getCompany(): CompanyInfo {
    try {
      const stored = localStorage.getItem(KEYS.COMPANY);
      return stored ? JSON.parse(stored) : DEFAULT_COMPANY;
    } catch {
      return DEFAULT_COMPANY;
    }
  },
  getCompanyInfo(): CompanyInfo {
    return this.getCompany();
  },
  saveCompany(company: CompanyInfo): void {
    localStorage.setItem(KEYS.COMPANY, JSON.stringify(company));
  },
  saveCompanyInfo(company: CompanyInfo): void {
    this.saveCompany(company);
  },

  // 1. Folios de Seguimiento
  getFolios(): FolioSeguimiento[] {
    try {
      const stored = localStorage.getItem(KEYS.FOLIOS);
      if (!stored) {
        localStorage.setItem(KEYS.FOLIOS, JSON.stringify(INITIAL_FOLIOS));
        return INITIAL_FOLIOS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_FOLIOS;
    }
  },
  getFoliosSeguimiento(): FolioSeguimiento[] {
    return this.getFolios();
  },
  saveFolio(folio: FolioSeguimiento): FolioSeguimiento[] {
    const list = this.getFolios();
    const index = list.findIndex((item) => item.id === folio.id);
    let updated: FolioSeguimiento[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...folio, updatedAt: new Date().toISOString() };
    } else {
      updated = [folio, ...list];
    }
    localStorage.setItem(KEYS.FOLIOS, JSON.stringify(updated));
    return updated;
  },
  deleteFolio(id: string): FolioSeguimiento[] {
    const list = this.getFolios().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.FOLIOS, JSON.stringify(list));
    return list;
  },
  getNextFolioNumber(): string {
    const list = this.getFolios();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `FOL-${year}-${num}`;
  },

  // 2. Cotizaciones
  getCotizaciones(): Cotizacion[] {
    try {
      const stored = localStorage.getItem(KEYS.COTIZACIONES);
      if (!stored) {
        localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(INITIAL_COTIZACIONES));
        return INITIAL_COTIZACIONES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_COTIZACIONES;
    }
  },
  saveCotizacion(cotizacion: Cotizacion): Cotizacion[] {
    const list = this.getCotizaciones();
    const index = list.findIndex((item) => item.id === cotizacion.id);
    let updated: Cotizacion[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...cotizacion, updatedAt: new Date().toISOString() };
    } else {
      updated = [cotizacion, ...list];
    }
    localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(updated));
    return updated;
  },
  deleteCotizacion(id: string): Cotizacion[] {
    const list = this.getCotizaciones().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(list));
    return list;
  },
  getNextCotizacionNumber(): string {
    const list = this.getCotizaciones();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `COT-${year}-${num}`;
  },

  // 3. Órdenes Taller
  getOrdenesTaller(): OrdenTaller[] {
    try {
      const stored = localStorage.getItem(KEYS.ORDENES);
      if (!stored) {
        localStorage.setItem(KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_TALLER));
        return INITIAL_ORDENES_TALLER;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ORDENES_TALLER;
    }
  },
  saveOrdenTaller(orden: OrdenTaller): OrdenTaller[] {
    const list = this.getOrdenesTaller();
    const index = list.findIndex((item) => item.id === orden.id);
    let updated: OrdenTaller[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...orden, updatedAt: new Date().toISOString() };
    } else {
      updated = [orden, ...list];
    }
    localStorage.setItem(KEYS.ORDENES, JSON.stringify(updated));
    return updated;
  },
  deleteOrdenTaller(id: string): OrdenTaller[] {
    const list = this.getOrdenesTaller().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.ORDENES, JSON.stringify(list));
    return list;
  },
  getNextOrdenTallerNumber(): string {
    const list = this.getOrdenesTaller();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `OT-${year}-${num}`;
  },

  // 4. Reportes en Sitio
  getReportesSitio(): ReporteSitio[] {
    try {
      const stored = localStorage.getItem(KEYS.REPORTES);
      if (!stored) {
        localStorage.setItem(KEYS.REPORTES, JSON.stringify(INITIAL_REPORTES_SITIO));
        return INITIAL_REPORTES_SITIO;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_REPORTES_SITIO;
    }
  },
  saveReporteSitio(reporte: ReporteSitio): ReporteSitio[] {
    const list = this.getReportesSitio();
    const index = list.findIndex((item) => item.id === reporte.id);
    let updated: ReporteSitio[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...reporte, updatedAt: new Date().toISOString() };
    } else {
      updated = [reporte, ...list];
    }
    localStorage.setItem(KEYS.REPORTES, JSON.stringify(updated));
    return updated;
  },
  deleteReporteSitio(id: string): ReporteSitio[] {
    const list = this.getReportesSitio().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.REPORTES, JSON.stringify(list));
    return list;
  },
  getNextReporteNumber(): string {
    const list = this.getReportesSitio();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `REP-${year}-${num}`;
  },

  // 5. Hojas de Servicio
  getHojasServicio(): HojaServicio[] {
    try {
      const stored = localStorage.getItem(KEYS.HOJAS);
      if (!stored) {
        localStorage.setItem(KEYS.HOJAS, JSON.stringify(INITIAL_HOJAS_SERVICIO));
        return INITIAL_HOJAS_SERVICIO;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_HOJAS_SERVICIO;
    }
  },
  saveHojaServicio(hoja: HojaServicio): HojaServicio[] {
    const list = this.getHojasServicio();
    const index = list.findIndex((item) => item.id === hoja.id);
    let updated: HojaServicio[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...hoja, updatedAt: new Date().toISOString() };
    } else {
      updated = [hoja, ...list];
    }
    localStorage.setItem(KEYS.HOJAS, JSON.stringify(updated));
    return updated;
  },
  deleteHojaServicio(id: string): HojaServicio[] {
    const list = this.getHojasServicio().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.HOJAS, JSON.stringify(list));
    return list;
  },
  getNextHojaServicioNumber(): string {
    const list = this.getHojasServicio();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `HS-${year}-${num}`;
  },

  // Reset to default
  resetData(): void {
    localStorage.setItem(KEYS.FOLIOS, JSON.stringify(INITIAL_FOLIOS));
    localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(INITIAL_COTIZACIONES));
    localStorage.setItem(KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_TALLER));
    localStorage.setItem(KEYS.REPORTES, JSON.stringify(INITIAL_REPORTES_SITIO));
    localStorage.setItem(KEYS.HOJAS, JSON.stringify(INITIAL_HOJAS_SERVICIO));
    localStorage.setItem(KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
  },
};
