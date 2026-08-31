export type ModuleType =
  | 'metricas'
  | 'folio_seguimiento'
  | 'cotizacion'
  | 'orden_taller'
  | 'reporte_sitio'
  | 'hoja_servicio';

export type StatusType =
  | 'Nuevo'
  | 'En Diagnóstico'
  | 'Presupuestado'
  | 'Esperando Aprobación'
  | 'En Reparación'
  | 'Esperando Refacciones'
  | 'Listo para Entrega'
  | 'Entregado / Cerrado'
  | 'Cancelado'
  | 'Garantía';

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// 1. Folio de Seguimiento
export interface FolioSeguimiento extends BaseRecord {
  // Encabezado y Control
  folio: string; // Autonumérico (ej. FOL-2026-001)
  estatus: StatusType;
  fecha: string; // YYYY-MM-DD
  atendio: string; // Personal
  // Datos Generales
  numeroOrden: string;
  cliente: string;
  // Información del Equipo
  equipoCategoria: string; // Refrigerador, Lavadora, Secadora, Microondas, Clima/Minisplit, TV, etc.
  modelo: string;
  serie: string;
  // Diagnóstico y Trabajos
  reparacionConsisteEn: string;
  costosReparacionDesglose: string;
  // Costos y Condiciones
  reparacionTotal: number;
  revisionPagada: number;
  anticipoRequerido: number; // 70% calculada
  restanReparacion: number; // calculada: Total - (RevisionPagada + Anticipo o Pago)
  vigenciaPresupuesto: string; // ej. "15 días hábiles" o fecha
  // Refacciones y Extras
  numeroParte: string;
  observaciones: string;
  adjuntos: { name: string; size: string; dataUrl?: string; type: string }[];
}

// 2. No. Cotización
export interface Cotizacion extends BaseRecord {
  // Encabezado y Control
  numeroCotizacion: string; // Autonumérico (ej. COT-2026-001)
  referenciaRef: string;
  estatus: StatusType;
  fechaPedido: string;
  atendio: string;
  // Datos del Cliente
  nombreCliente: string;
  telefono: string;
  celular: string;
  // Datos del Aparato
  aparato: string;
  marca: string;
  modelo: string; // Obligatorio
  serie: string;
  // Detalle de la Cotización
  nombreNumeroParte: string;
  notaPolitica: string; // Fijo: "En piezas eléctricas no hay devolución, ni garantía"
  detallesOperacion: string;
  costoRefaccion: number;
  datosPedido: string;
}

// 3. Orden Taller
export interface OrdenTaller extends BaseRecord {
  // Encabezado y Control
  numeroOrdenTaller: string; // Autonumérico (ej. OT-2026-001)
  estatus: StatusType;
  fechaIngreso: string;
  atendio: string;
  // Datos del Cliente y Ubicación
  nombreCliente: string;
  direccion: string;
  colonia: string;
  telefono: string;
  celular: string;
  // Datos del Aparato
  aparato: string;
  marca: string;
  modeloCode: string;
  serie: string;
  // Recepción y Diagnóstico
  falla: string;
  accesoriosObservaciones: string;
  tecnicoAsignado: string;
  // Presupuesto y Partes
  presupuesto: number;
  refacciones: string;
  numeroPedido: string;
  // Seguridad
  informacionConfidencial: string; // Área restringida
}

// 4. # de Reporte (Servicio en Sitio / Domicilio)
export interface ReporteSitio extends BaseRecord {
  // Encabezado y Control
  numeroReporte: string; // Autonumérico (ej. REP-2026-001)
  tipoServicio: 'Con cargo' | 'Garantía' | 'Mantenimiento' | 'Revisión técnica' | 'Instalación';
  fechaReporte: string;
  atendio: string;
  // Datos del Cliente y Domicilio
  nombreCliente: string;
  direccion: string; // Número, entre calles y referencias
  colonia: string;
  tipoCasa: 'Casa de 1 piso' | 'Casa de 2 pisos' | 'Departamento' | 'Local comercial' | 'Oficina' | 'Privada/Condominio';
  telefono: string;
  celular: string;
  // Identificación del Equipo
  aparato: string;
  marca: string;
  modelo: string;
  serieDifusor: string;
  serieEquipo: string;
  // Falla y Visitas
  fallaReportada: string;
  fechaVisita: string;
  horaVisita: string;
  tecnico: string;
  detalles1erVisita: string;
  detalles2daVisita: string;
  detalles3eraVisita: string;
  // Costeo y Cierre
  presupuesto: number;
  partesSolicitadas: string;
  numeroPedido: string;
  observaciones: string;
  numeroOrdenServicio: string;
  informacionConfidencial: string;
}

// 5. Hoja de Servicio (Reporte Oficial de Marca / Taller)
export interface RefaccionItem {
  id: string;
  numeroParte: string;
  descripcion: string;
  cantidad: number;
  monto: number;
}

export interface HojaServicio extends BaseRecord {
  // Control y Encabezado
  folioLGEMS: string; // No. Orden / Folio LGEMS (ej. HS-2026-001)
  centroServicioAutorizado: string;
  tipoServicio: 'In-Home (Domicilio)' | 'Taller (Carry-In)' | 'Comercial' | 'Revisión Especializada';
  garantia: 'Sí' | 'No';
  fechaRecepcion: string;
  fechaRequerida: string;
  fechaInicioAtencion: string;
  fechaFinAtencion: string;
  fechaEntrega: string;
  // Datos del Cliente
  nombreCompleto: string;
  domicilioCompleto: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  telefonoFijo: string;
  celular: string;
  // Datos del Producto y Falla
  tipoProducto: string;
  modelo: string;
  numeroSerie: string;
  distribuidor: string;
  fechaCompra: string;
  sintomaFallaReportada: string;
  observacionesDiagnostico: string;
  // Validaciones Técnicas y Condiciones de Instalación
  hayTierraFisica: 'Sí' | 'No' | 'No verificable';
  voltajeDomicilio: string; // ej. 122V
  presionAguaPSI: string; // ej. 28 PSI
  presionGas: string; // ej. 11 inH2O / 0.4 PSI
  condicionesFisicas: {
    golpesRayones: boolean;
    faltanTornillos: boolean;
    intervenidoTerceros: boolean;
    humedadOxido: boolean;
    cablesDañados: boolean;
    limpioYCompleto: boolean;
    detallesExtras?: string;
  };
  tecnicoAsignado: string;
  fechaConfirmacionVisita: string;
  // Tabla de Refacciones Utilizadas
  refacciones: RefaccionItem[];
  // Liquidación Financiera
  manoDeObra: number;
  transporte: number;
  visita: number;
  materiales: number;
  repuestosMonto: number; // Calculado de la suma de refacciones o manual
  ivaPorcentaje: number; // Por defecto 16%
  ivaMonto: number; // Calculado
  total: number; // Calculado
  // Validación de Cobro
  realizoPago: 'Sí' | 'No';
  cantidadPagada: number;
  motivoPago: 'Instalación' | 'Reparación' | 'Material' | 'Visita/Diagnóstico' | 'Anticipo' | 'Liquidación Total';
  // Validación de Garantía
  validacionGarantia: 'Por documento (Póliza/Factura)' | 'Por número de serie (Sistema)' | 'Fuera de Garantía' | 'En Validación';
  // Firmas Digitales
  nombreTecnico: string;
  firmaTecnicoDataUrl?: string;
  nombreClienteFirma: string;
  firmaClienteDataUrl?: string;
}

export type AnyRecord = FolioSeguimiento | Cotizacion | OrdenTaller | ReporteSitio | HojaServicio;

export interface CompanyInfo {
  name: string;
  commercialName: string;
  rfc: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  website: string;
  logoUrl?: string;
  authorizedCenter: string;
}
