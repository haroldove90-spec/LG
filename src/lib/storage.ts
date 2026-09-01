import {
  FolioSeguimiento,
  Cotizacion,
  OrdenTaller,
  ReporteSitio,
  HojaServicio,
  AgendaContact,
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
  INITIAL_AGENDA,
} from '../data/initialData';

const KEYS = {
  COMPANY: 'servitrack_company',
  FOLIOS: 'servitrack_folios',
  COTIZACIONES: 'servitrack_cotizaciones',
  ORDENES: 'servitrack_ordenes',
  REPORTES: 'servitrack_reportes',
  HOJAS: 'servitrack_hojas',
  AGENDA: 'servitrack_agenda',
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
      if (stored === null) {
        localStorage.setItem(KEYS.FOLIOS, JSON.stringify(INITIAL_FOLIOS));
        return INITIAL_FOLIOS;
      }
      return JSON.parse(stored);
    } catch {
      return [];
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
      if (stored === null) {
        localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(INITIAL_COTIZACIONES));
        return INITIAL_COTIZACIONES;
      }
      return JSON.parse(stored);
    } catch {
      return [];
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
    if (list.length === 0) return '8292';
    
    // Extract numeric IDs from list
    const numericValues = list
      .map((c) => {
        const clean = (c.numeroCotizacion || '').replace(/[^0-9]/g, '');
        return clean ? parseInt(clean, 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    if (numericValues.length > 0) {
      const maxVal = Math.max(...numericValues);
      return String(maxVal + 1);
    }

    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `COT-${year}-${num}`;
  },

  // 3. Órdenes Taller
  getOrdenesTaller(): OrdenTaller[] {
    try {
      const stored = localStorage.getItem(KEYS.ORDENES);
      if (stored === null) {
        localStorage.setItem(KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_TALLER));
        return INITIAL_ORDENES_TALLER;
      }
      return JSON.parse(stored);
    } catch {
      return [];
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
    if (list.length === 0) return '5259';

    // Extract numeric IDs from list
    const numericValues = list
      .map((c) => {
        const clean = (c.numeroOrdenTaller || '').replace(/[^0-9]/g, '');
        return clean ? parseInt(clean, 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    if (numericValues.length > 0) {
      const maxVal = Math.max(...numericValues);
      return String(maxVal + 1);
    }

    const count = list.length + 1;
    const year = new Date().getFullYear();
    const num = String(count).padStart(3, '0');
    return `OT-${year}-${num}`;
  },

  // 4. Reportes en Sitio
  getReportesSitio(): ReporteSitio[] {
    try {
      const stored = localStorage.getItem(KEYS.REPORTES);
      if (stored === null) {
        localStorage.setItem(KEYS.REPORTES, JSON.stringify(INITIAL_REPORTES_SITIO));
        return INITIAL_REPORTES_SITIO;
      }
      return JSON.parse(stored);
    } catch {
      return [];
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
    if (list.length === 0) return '11740';
    
    // Extract numeric IDs from list
    const numericValues = list
      .map((r) => {
        const clean = (r.numeroReporte || '').replace(/[^0-9]/g, '');
        return clean ? parseInt(clean, 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    if (numericValues.length > 0) {
      const maxVal = Math.max(...numericValues);
      return String(maxVal + 1);
    }

    return '11740';
  },

  // 5. Hojas de Servicio
  getHojasServicio(): HojaServicio[] {
    try {
      const stored = localStorage.getItem(KEYS.HOJAS);
      if (stored === null) {
        localStorage.setItem(KEYS.HOJAS, JSON.stringify(INITIAL_HOJAS_SERVICIO));
        return INITIAL_HOJAS_SERVICIO;
      }
      return JSON.parse(stored);
    } catch {
      return [];
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

  // 6. Agenda de Contactos / Directorio
  getAgenda(): AgendaContact[] {
    try {
      const stored = localStorage.getItem(KEYS.AGENDA);
      if (stored === null) {
        localStorage.setItem(KEYS.AGENDA, JSON.stringify(INITIAL_AGENDA));
        return INITIAL_AGENDA;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },
  getAgendaContacts(): AgendaContact[] {
    return this.getAgenda();
  },
  saveAgendaContact(contact: AgendaContact): AgendaContact[] {
    const list = this.getAgenda();
    const index = list.findIndex((item) => item.id === contact.id);
    let updated: AgendaContact[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...contact, updatedAt: new Date().toISOString() };
    } else {
      updated = [contact, ...list];
    }
    localStorage.setItem(KEYS.AGENDA, JSON.stringify(updated));
    return updated;
  },
  deleteAgendaContact(id: string): AgendaContact[] {
    const list = this.getAgenda().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.AGENDA, JSON.stringify(list));
    return list;
  },
  duplicateAgendaContact(id: string): { list: AgendaContact[]; duplicated: AgendaContact | null } {
    const list = this.getAgenda();
    const original = list.find((item) => item.id === id);
    if (!original) return { list, duplicated: null };

    const nextId = this.getNextAgendaId();
    const newContact: AgendaContact = {
      ...original,
      id: `agenda-${Date.now()}`,
      agendaId: nextId,
      nombre: `${original.nombre} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newContact, ...list];
    localStorage.setItem(KEYS.AGENDA, JSON.stringify(updated));
    return { list: updated, duplicated: newContact };
  },
  getNextAgendaId(): string {
    const list = this.getAgenda();
    if (list.length === 0) return '1';
    // try finding highest numeric ID
    const maxNum = list.reduce((max, item) => {
      const parsed = parseInt(item.agendaId, 10);
      return !isNaN(parsed) && parsed > max ? parsed : max;
    }, 0);
    return String(maxNum + 1);
  },

  // Reset to default
  resetData(): void {
    localStorage.setItem(KEYS.FOLIOS, JSON.stringify(INITIAL_FOLIOS));
    localStorage.setItem(KEYS.COTIZACIONES, JSON.stringify(INITIAL_COTIZACIONES));
    localStorage.setItem(KEYS.ORDENES, JSON.stringify(INITIAL_ORDENES_TALLER));
    localStorage.setItem(KEYS.REPORTES, JSON.stringify(INITIAL_REPORTES_SITIO));
    localStorage.setItem(KEYS.HOJAS, JSON.stringify(INITIAL_HOJAS_SERVICIO));
    localStorage.setItem(KEYS.AGENDA, JSON.stringify(INITIAL_AGENDA));
    localStorage.setItem(KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
  },
};
