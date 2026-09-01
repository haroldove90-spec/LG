import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Save,
  Printer,
  Copy,
  Trash2,
  Edit,
  X,
  Phone,
  Mail,
  Building2,
  Globe,
  MapPin,
  BookUser,
  Sparkles,
  LayoutList,
  LayoutGrid,
  Table as TableIcon,
  Smartphone,
  FileSpreadsheet,
  FileDown,
  ExternalLink,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  ArrowRight,
  UserPlus,
  RotateCcw,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AgendaContact, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';

const ITEMS_PER_PAGE = 10;

export const AgendaModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [contacts, setContacts] = useState<AgendaContact[]>(() => StorageService.getAgenda());
  
  // Vista principal: En primera instancia SIEMPRE el formulario en blanco ('create'), con botón para ir a buscar ('directory')
  const [mainView, setMainView] = useState<'create' | 'directory'>('create');
  
  // Búsqueda en directorio
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modo de visualización en directorio (Predeterminado: 'horizontal')
  const [viewMode, setViewMode] = useState<'horizontal' | 'table' | 'grid'>('horizontal');
  
  // Paginación en directorio
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de edición y eliminación
  const [editingItem, setEditingItem] = useState<AgendaContact | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AgendaContact | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State Inicial en blanco
  const getBlankFormState = (): Partial<AgendaContact> => ({
    agendaId: StorageService.getNextAgendaId(),
    nombre: '',
    telefono: '',
    extension: '',
    movil: '',
    fax: '',
    correoElectronico: '',
    organizacion: '',
    cargo: '',
    informacionAdicional: '',
  });

  const [formData, setFormData] = useState<Partial<AgendaContact>>(getBlankFormState());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper de Impresión Directa (Iframe invisible)
  const printDirectly = (htmlBody: string, docTitle: string) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="utf-8" />
              <title>${docTitle}</title>
              <style>
                @page {
                  size: letter portrait;
                  margin: 12mm 15mm;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  color: #0f172a;
                  background: #ffffff;
                  margin: 0;
                  padding: 0;
                  font-size: 12px;
                  line-height: 1.45;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                * {
                  box-sizing: border-box;
                }
                .header {
                  border-bottom: 2px solid #0f172a;
                  padding-bottom: 12px;
                  margin-bottom: 18px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                }
                .company-name {
                  font-size: 11px;
                  font-weight: 800;
                  text-transform: uppercase;
                  color: #475569;
                  letter-spacing: 0.5px;
                }
                .doc-title {
                  font-size: 20px;
                  font-weight: 900;
                  color: #0f172a;
                  margin-top: 2px;
                  letter-spacing: -0.5px;
                }
                .badge {
                  background: #0f172a;
                  color: #ffffff;
                  font-family: monospace;
                  font-weight: 700;
                  font-size: 13px;
                  padding: 6px 12px;
                  border-radius: 4px;
                  display: inline-block;
                }
                .section-title {
                  font-size: 10px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  color: #334155;
                  margin-top: 14px;
                  margin-bottom: 6px;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 4px;
                }
                .box {
                  border: 1px solid #cbd5e1;
                  border-radius: 6px;
                  padding: 10px 12px;
                  margin-bottom: 10px;
                }
                .box-gray {
                  background-color: #f8fafc;
                }
                .field-label {
                  font-size: 9px;
                  font-weight: 700;
                  text-transform: uppercase;
                  color: #64748b;
                  display: block;
                  margin-bottom: 2px;
                }
                .field-value {
                  font-size: 13px;
                  font-weight: 700;
                  color: #0f172a;
                }
                .grid-2 {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 12px;
                }
                .grid-4 {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 10px;
                }
                .notes-box {
                  background: #f8fafc;
                  border: 1px solid #cbd5e1;
                  border-radius: 6px;
                  padding: 12px;
                  font-size: 11px;
                  color: #1e293b;
                  line-height: 1.5;
                  white-space: pre-wrap;
                }
                .footer {
                  border-top: 1px solid #cbd5e1;
                  padding-top: 8px;
                  margin-top: 24px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 10px;
                  color: #94a3b8;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10.5px;
                  margin-top: 10px;
                }
                th {
                  background: #0f172a;
                  color: #ffffff;
                  text-align: left;
                  padding: 8px 10px;
                  font-size: 9.5px;
                  text-transform: uppercase;
                  font-weight: 800;
                }
                td {
                  padding: 8px 10px;
                  border-bottom: 1px solid #e2e8f0;
                }
                tr:nth-child(even) {
                  background-color: #f8fafc;
                }
              </style>
            </head>
            <body>
              ${htmlBody}
            </body>
          </html>
        `);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Error invoking print:', e);
            window.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1500);
          }
        }, 200);
      }
    } catch (err) {
      console.error('Fallback print:', err);
      window.print();
    }
  };

  // Preparar formulario en blanco para nuevo cliente
  const handleStartNewRegistration = () => {
    setEditingItem(null);
    setFormData(getBlankFormState());
    setMainView('create');
  };

  // Limpiar campos del formulario
  const handleClearForm = () => {
    setEditingItem(null);
    setFormData(getBlankFormState());
    showToast('✨ Formulario en blanco listo para registrar.');
  };

  // Cargar registro para editar en el formulario
  const handleEditRecord = (contact: AgendaContact) => {
    setEditingItem(contact);
    setFormData({ ...contact });
    setMainView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guardar registro (Crear nuevo o Actualizar)
  const handleSaveRecord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.nombre?.trim()) {
      showToast('⚠️ Por favor ingresa el Nombre del cliente o contacto.');
      return;
    }

    const now = new Date().toISOString();
    const recordToSave: AgendaContact = {
      id: editingItem ? editingItem.id : `agenda-${Date.now()}`,
      agendaId: formData.agendaId?.trim() || StorageService.getNextAgendaId(),
      nombre: formData.nombre.trim(),
      telefono: formData.telefono?.trim() || '',
      extension: formData.extension?.trim() || '',
      movil: formData.movil?.trim() || '',
      fax: formData.fax?.trim() || '',
      correoElectronico: formData.correoElectronico?.trim() || '',
      organizacion: formData.organizacion?.trim() || '',
      cargo: formData.cargo?.trim() || '',
      informacionAdicional: formData.informacionAdicional?.trim() || '',
      createdAt: editingItem ? editingItem.createdAt : now,
      updatedAt: now,
    };

    const updatedList = StorageService.saveAgendaContact(recordToSave);
    setContacts(updatedList);

    if (editingItem) {
      showToast(`✅ Registro Id #${recordToSave.agendaId} actualizado correctamente.`);
      setEditingItem(null);
      setFormData(getBlankFormState());
    } else {
      showToast(`✅ Cliente Id #${recordToSave.agendaId} guardado con éxito en la agenda.`);
      // Restablecer a formulario en blanco con nuevo ID consecutivo
      setFormData(getBlankFormState());
    }
  };

  // Duplicar registro
  const handleDuplicateRecord = (contact: AgendaContact) => {
    const { list, duplicated } = StorageService.duplicateAgendaContact(contact.id);
    setContacts(list);
    if (duplicated) {
      showToast(`📋 Registro Id #${contact.agendaId} duplicado exitosamente como Id #${duplicated.agendaId}.`);
    }
  };

  // Eliminar registro con confirmación permanente
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const updatedList = StorageService.deleteAgendaContact(deleteCandidate.id);
    setContacts(updatedList);
    showToast(`🗑️ Registro Id #${deleteCandidate.agendaId} eliminado permanentemente.`);
    setDeleteCandidate(null);
  };

  // Imprimir ficha individual directamente
  const handlePrintSingle = (contact: AgendaContact) => {
    const html = `
      <div class="header">
        <div>
          <div class="company-name">${company.commercialName || 'CENTRO DE SERVICIO AUTORIZADO'}</div>
          <div class="doc-title">FICHA DE AGENDA & CONTACTO</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${company.address || ''} • Tel: ${company.phone || ''} • RFC: ${company.rfc || ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="badge">REGISTRO ID #${contact.agendaId}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Fecha: ${new Date().toLocaleDateString('es-MX')}
          </div>
        </div>
      </div>

      <div class="box box-gray">
        <div class="field-label">Nombre / Contacto / Programa Técnico</div>
        <div class="field-value" style="font-size: 16px; color: #0f172a;">${contact.nombre}</div>
      </div>

      <div class="section-title">Líneas de Comunicación</div>
      <div class="grid-4">
        <div class="box">
          <div class="field-label">Teléfono Fijo</div>
          <div class="field-value">${contact.telefono || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Extensión</div>
          <div class="field-value">${contact.extension || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Móvil / Celular</div>
          <div class="field-value">${contact.movil || 'N/A'}</div>
        </div>
        <div class="box">
          <div class="field-label">Fax</div>
          <div class="field-value">${contact.fax || 'N/A'}</div>
        </div>
      </div>

      <div class="section-title">Datos Institucionales & Operativos</div>
      <div class="grid-2">
        <div class="box">
          <div class="field-label">Correo Electrónico</div>
          <div class="field-value" style="font-size: 12px; word-break: break-all;">
            ${contact.correoElectronico || 'N/A'}
          </div>
        </div>
        <div class="box">
          <div class="field-label">Organización / Área / Empresa</div>
          <div class="field-value" style="font-size: 12px;">
            ${contact.organizacion || 'N/A'}
          </div>
        </div>
      </div>

      ${
        contact.cargo
          ? `
        <div class="box" style="margin-top: 6px;">
          <div class="field-label">Cargo / Puesto / Enlace Técnico</div>
          <div class="field-value" style="font-size: 12px; font-family: monospace;">
            ${contact.cargo}
          </div>
        </div>
      `
          : ''
      }

      ${
        contact.informacionAdicional
          ? `
        <div class="section-title">Información Adicional / Ubicación y Referencias</div>
        <div class="notes-box">
          ${contact.informacionAdicional}
        </div>
      `
          : ''
      }

      <div class="footer">
        <div>${company.name || 'ServiTrack Pro'} • ${company.rfc || ''}</div>
        <div>Ficha Oficial de Control Técnico • Página 1 de 1</div>
      </div>
    `;

    printDirectly(html, `Agenda_Registro_${contact.agendaId}`);
  };

  // Imprimir Todo el Directorio Directamente
  const handlePrintAll = () => {
    const rowsHtml = filteredContacts
      .map(
        (c) => `
      <tr>
        <td style="font-weight: 700; font-family: monospace;">#${c.agendaId}</td>
        <td>
          <div style="font-weight: 700;">${c.nombre}</div>
          ${c.correoElectronico ? `<div style="font-size: 9.5px; color: #64748b;">${c.correoElectronico}</div>` : ''}
        </td>
        <td>${c.organizacion || '--'}</td>
        <td>
          <div>${c.telefono || '--'}</div>
          ${c.extension ? `<div style="font-size: 9px; color: #64748b;">Ext: ${c.extension}</div>` : ''}
        </td>
        <td>
          <div>${c.movil || '--'}</div>
          ${c.fax ? `<div style="font-size: 9px; color: #64748b;">Fax: ${c.fax}</div>` : ''}
        </td>
        <td style="font-family: monospace; font-size: 10px;">${c.cargo || '--'}</td>
        <td style="font-size: 10px; max-width: 180px;">${c.informacionAdicional || '--'}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <div class="header">
        <div>
          <div class="company-name">${company.commercialName || 'CENTRO DE SERVICIO AUTORIZADO'}</div>
          <div class="doc-title">DIRECTORIO GENERAL DE AGENDA</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${company.address || ''} • Tel: ${company.phone || ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="badge">TOTAL: ${filteredContacts.length} REGISTROS</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Fecha: ${new Date().toLocaleDateString('es-MX')}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre / Contacto</th>
            <th>Organización</th>
            <th>Tel / Ext</th>
            <th>Móvil / Fax</th>
            <th>Cargo / Enlace</th>
            <th>Información Adicional</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div>${company.name || 'ServiTrack Pro'} • RFC: ${company.rfc || ''}</div>
        <div>Directorio Oficial de Contactos Técnicos</div>
      </div>
    `;

    printDirectly(html, `Directorio_Agenda_${new Date().toISOString().split('T')[0]}`);
  };

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = [
      'Id',
      'Nombre',
      'Organización',
      'Teléfono',
      'Extensión',
      'Móvil',
      'Fax',
      'Correo Electrónico',
      'Cargo / Enlace',
      'Información Adicional',
    ];
    const rows = filteredContacts.map((c) => [
      `"${c.agendaId}"`,
      `"${c.nombre.replace(/"/g, '""')}"`,
      `"${c.organizacion.replace(/"/g, '""')}"`,
      `"${c.telefono}"`,
      `"${c.extension}"`,
      `"${c.movil}"`,
      `"${c.fax}"`,
      `"${c.correoElectronico}"`,
      `"${c.cargo.replace(/"/g, '""')}"`,
      `"${c.informacionAdicional.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Agenda_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Agenda exportada a CSV exitosamente.');
  };

  // Normalizador de texto para búsqueda flexible
  const normalizeText = (text: string) => {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const stripSpecialChars = (text: string) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  };

  // Filtrado de contactos multi-campo
  const filteredContacts = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return contacts;

    const normQuery = normalizeText(rawQuery);
    const cleanQuery = stripSpecialChars(rawQuery);

    return contacts.filter((c) => {
      // 1. Coincidencia por ID (ej. 1560 o #1560)
      const rawId = (c.agendaId || '').trim();
      const idWithHash = `#${rawId}`.toLowerCase();
      const cleanId = stripSpecialChars(rawId);

      if (
        rawId === rawQuery ||
        rawId.toLowerCase().includes(normQuery) ||
        idWithHash.includes(normQuery) ||
        (cleanQuery && cleanId.includes(cleanQuery)) ||
        (cleanQuery && cleanId === cleanQuery)
      ) {
        return true;
      }

      // 2. Coincidencia en campos de texto
      const normNombre = normalizeText(c.nombre);
      const normOrg = normalizeText(c.organizacion);
      const normTel = normalizeText(c.telefono);
      const normExt = normalizeText(c.extension);
      const normMovil = normalizeText(c.movil);
      const normFax = normalizeText(c.fax);
      const normEmail = normalizeText(c.correoElectronico);
      const normCargo = normalizeText(c.cargo);
      const normInfo = normalizeText(c.informacionAdicional);

      if (
        normNombre.includes(normQuery) ||
        normOrg.includes(normQuery) ||
        normTel.includes(normQuery) ||
        normExt.includes(normQuery) ||
        normMovil.includes(normQuery) ||
        normFax.includes(normQuery) ||
        normEmail.includes(normQuery) ||
        normCargo.includes(normQuery) ||
        normInfo.includes(normQuery)
      ) {
        return true;
      }

      // 3. Coincidencia limpia en números telefónicos
      if (cleanQuery.length >= 3) {
        const cleanTel = stripSpecialChars(c.telefono);
        const cleanMovil = stripSpecialChars(c.movil);
        const cleanExt = stripSpecialChars(c.extension);
        if (
          cleanTel.includes(cleanQuery) ||
          cleanMovil.includes(cleanQuery) ||
          cleanExt.includes(cleanQuery)
        ) {
          return true;
        }
      }

      return false;
    });
  }, [contacts, searchQuery]);

  // Reset de página al cambiar búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Cálculos de paginación (10 registros por bloque)
  const totalItems = filteredContacts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedContacts = useMemo(() => {
    return filteredContacts.slice(startIndex, endIndex);
  }, [filteredContacts, startIndex, endIndex]);

  const hasMorePages = totalPages > 1;
  const remainingItems = totalItems - endIndex;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Principal con conmutador claro entre FORMULARIO EN BLANCO y BUSCAR / DIRECTORIO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Módulo de Agenda
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {contacts.length} registros guardados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <BookUser className="w-6 h-6 text-emerald-600" />
            Agenda & Directorio de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {mainView === 'create'
              ? editingItem
                ? `Editando registro Id #${formData.agendaId}`
                : 'Formulario en blanco listo para registrar un nuevo cliente o programa técnico.'
              : 'Búsqueda, consulta y administración general de registros en agenda.'}
          </p>
        </div>

        {/* Botonera Principal de Navegación del Módulo */}
        <div className="flex flex-wrap items-center gap-2">
          {mainView === 'create' ? (
            /* Botón para que el admin vaya a BUSCAR UN REGISTRO o VER LA LISTA */
            <button
              onClick={() => {
                setMainView('directory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="btn-ir-a-buscar-registros"
              className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer border border-slate-800"
              title="Ir a buscar un registro o consultar la lista completa de contactos"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Buscar Registros / Directorio</span>
              <span className="bg-slate-800 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ml-1">
                {contacts.length}
              </span>
            </button>
          ) : (
            /* Botón para regresar al FORMULARIO EN BLANCO para registrar nuevo cliente */
            <button
              onClick={handleStartNewRegistration}
              id="btn-ir-a-nuevo-cliente"
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Abrir el formulario en blanco para registrar un nuevo cliente"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Registrar Nuevo Cliente</span>
            </button>
          )}

          {/* Botones de acción complementaria cuando está en el directorio */}
          {mainView === 'directory' && (
            <>
              <button
                onClick={handlePrintAll}
                id="btn-imprimir-directorio-general"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                title="Imprimir todos los registros filtrados"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Imprimir Agenda</span>
              </button>

              <button
                onClick={handleExportCSV}
                id="btn-exportar-csv-agenda"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
                title="Exportar a CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </button>

              {/* Conmutador de Vistas del Directorio */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  onClick={() => setViewMode('horizontal')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                    viewMode === 'horizontal'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista Horizontal (Predeterminada)"
                >
                  <LayoutList className="w-4 h-4" />
                  <span className="hidden lg:inline">Horizontal</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                    viewMode === 'table'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista en Tabla"
                >
                  <TableIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Tabla</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                    viewMode === 'grid'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista en Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden lg:inline">Cuadrícula</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: FORMULARIO EN BLANCO PARA REGISTRAR NUEVO CLIENTE (PRIMERA INSTANCIA) */}
      {/* ========================================================================= */}
      {mainView === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          {/* Form Banner Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  {editingItem ? 'Editar Registro de Agenda' : 'Registrar Nuevo Cliente en Agenda'}
                </h2>
                <p className="text-xs text-slate-400">
                  {editingItem
                    ? 'Modifica los campos del contacto y guarda los cambios.'
                    : 'Captura los datos generales para dar de alta al cliente en el catálogo.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 font-medium">Asignación Id:</span>
                <span className="font-mono font-black text-emerald-400">#{formData.agendaId}</span>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/40 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveRecord} className="p-5 sm:p-7 space-y-6">
            {/* Sección: Identidad del Contacto */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Hash className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Identidad y Datos Principales
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Id del Registro */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Id de Registro <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="form-agendaId"
                      value={formData.agendaId || ''}
                      onChange={(e) => setFormData({ ...formData, agendaId: e.target.value })}
                      placeholder="Ej. 1560"
                      className="w-full pl-3 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-mono font-bold text-slate-900 transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Consecutivo automático editable.</span>
                </div>

                {/* Nombre / Cliente / Programa */}
                <div className="md:col-span-9">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre del Cliente / Contacto / Programa Técnico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="form-nombre"
                    required
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. REFACCIONES INDUSTRIALES DEL NORTE / CARLOS GÓMEZ"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-semibold text-slate-900 transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Nombre completo de la persona, razón comercial o programa de servicio.</span>
                </div>

                {/* Organización / Empresa / Área */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organización / Empresa / Sucursal
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="form-organizacion"
                      value={formData.organizacion || ''}
                      onChange={(e) => setFormData({ ...formData, organizacion: e.target.value })}
                      placeholder="Ej. DISTRIBUIDORA DE PARTES S.A. DE C.V."
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="form-correoElectronico"
                      value={formData.correoElectronico || ''}
                      onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                      placeholder="contacto@empresa.com.mx"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Teléfonos y Comunicación */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Phone className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Líneas Telefónicas y Contacto Directo
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Teléfono Fijo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teléfono Fijo
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="form-telefono"
                      value={formData.telefono || ''}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="(55) 5560-1560"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Extensión */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Extensión
                  </label>
                  <input
                    type="text"
                    id="form-extension"
                    value={formData.extension || ''}
                    onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    placeholder="Ej. 1560 o 600"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all font-medium"
                  />
                </div>

                {/* Móvil / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Móvil / Celular
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="form-movil"
                      value={formData.movil || ''}
                      onChange={(e) => setFormData({ ...formData, movil: e.target.value })}
                      placeholder="(55) 9156-0156"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Fax */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fax
                  </label>
                  <input
                    type="text"
                    id="form-fax"
                    value={formData.fax || ''}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    placeholder="(55) 5560-1561"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Cargo y Detalles Operativos */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Cargo, Enlace Web e Información Adicional
                </h3>
              </div>

              <div className="space-y-4">
                {/* Cargo / Puesto / URL Web */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cargo / Puesto / Enlace Web / Portal
                  </label>
                  <input
                    type="text"
                    id="form-cargo"
                    value={formData.cargo || ''}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Ej. http://www.servitecnico.com.mx/portal/1560 o Gerente de Garantías"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all font-mono"
                  />
                </div>

                {/* Información Adicional / Dirección / Notas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Información Adicional / Ubicación, Dirección y Notas de Atención
                  </label>
                  <textarea
                    id="form-informacionAdicional"
                    rows={4}
                    value={formData.informacionAdicional || ''}
                    onChange={(e) => setFormData({ ...formData, informacionAdicional: e.target.value })}
                    placeholder="Dirección, referencias de ubicación, horarios de atención, claves de descuento o notas especiales..."
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Footer con Botones de Acción */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Botón Guardar */}
                <button
                  type="submit"
                  id="btn-guardar-cliente-agenda"
                  className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Actualizar Registro' : 'Guardar Cliente en Agenda'}</span>
                </button>

                {/* Botón Limpiar */}
                <button
                  type="button"
                  onClick={handleClearForm}
                  id="btn-limpiar-formulario"
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  title="Restablecer todos los campos en blanco"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              </div>

              {/* Botón directo para ir a consultar el directorio */}
              <button
                type="button"
                onClick={() => {
                  setMainView('directory');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Ir a Buscar Registros ({contacts.length})</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: BUSCADOR Y LISTA DE REGISTROS (DIRECTORIO DE AGENDA)              */}
      {/* ========================================================================= */}
      {mainView === 'directory' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Buscador de registros */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Input Buscador */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="buscador-registros-agenda"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por Id (ej. 1560 o #1560), Nombre, Organización, Teléfono, Extensión, Cargo o Dirección..."
                  className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón rápido para volver al formulario en blanco */}
              <button
                onClick={handleStartNewRegistration}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Registrar Nuevo Cliente</span>
              </button>
            </div>

            {/* Barra de Resumen de Resultados y Paginación */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span>
                  Mostrando{' '}
                  <b className="text-slate-900">
                    {totalItems > 0 ? startIndex + 1 : 0} - {endIndex}
                  </b>{' '}
                  de <b className="text-slate-900">{totalItems}</b> registros
                </span>
                {searchQuery && (
                  <span className="text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                    Filtro: "{searchQuery}"
                  </span>
                )}
              </div>

              {/* Indicador de Páginas Existentes */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  Página {validCurrentPage} de {totalPages}
                </span>

                {hasMorePages && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg animate-pulse">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hay más páginas con resultados</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Alerta Destacada cuando hay múltiples páginas */}
          {hasMorePages && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Resultados divididos en bloques de <b>10 registros</b>. Actualmente en <b>Página {validCurrentPage} de {totalPages}</b> ({remainingItems > 0 ? `${remainingItems} registros en siguientes páginas` : 'Última página'}).
                </span>
              </div>
              {validCurrentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <span>Ver Página {validCurrentPage + 1}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Listado de Contactos en el Directorio */}
          {totalItems === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
              <BookUser className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No se encontraron registros</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? `No hay coincidencias para "${searchQuery}". Intenta con otros términos como el número Id, nombre, teléfono o limpia el buscador.`
                  : 'La agenda está vacía. Haz clic en "Registrar Nuevo Cliente" para dar de alta el primero.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                  >
                    Limpiar Buscador
                  </button>
                )}
                <button
                  onClick={handleStartNewRegistration}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ir al Formulario en Blanco</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'horizontal' ? (
            /* ========================================================================= */
            /* VISTA HORIZONTAL (1 COLUMNA EN MÓVIL, FILA EN ESCRITORIO)                */
            /* ========================================================================= */
            <div className="space-y-3.5 w-full">
              {paginatedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 group w-full"
                >
                  {/* Columna Izquierda / Cabecera Móvil: ID + Identidad */}
                  <div className="flex items-start gap-3 w-full lg:min-w-[260px] lg:max-w-[340px]">
                    {/* Badge ID */}
                    <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl px-3 py-2 shrink-0 border border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</span>
                      <span className="font-mono font-black text-sm text-emerald-400">#{contact.agendaId}</span>
                    </div>

                    {/* Nombre y Organización */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Contacto / Cliente
                      </span>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug tracking-tight break-words">
                        {contact.nombre}
                      </h3>

                      {contact.organizacion && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="break-words">{contact.organizacion}</span>
                        </div>
                      )}

                      {contact.correoElectronico && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${contact.correoElectronico}`}
                            className="break-all hover:text-emerald-700 transition-colors"
                          >
                            {contact.correoElectronico}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Centro: Comunicaciones (1 columna en móvil, 2 en pantallas más amplias) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs w-full lg:min-w-[220px] lg:max-w-[280px]">
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> Teléfono:
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {contact.telefono || <span className="text-slate-300 font-normal">--</span>}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:block">
                      <span className="text-[10px] font-semibold text-slate-400">Extensión:</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {contact.extension ? (
                          <span className="bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            Ext: {contact.extension}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">--</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:block">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" /> Móvil:
                      </span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {contact.movil || <span className="text-slate-300 font-normal">--</span>}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:block">
                      <span className="text-[10px] font-semibold text-slate-400">Fax:</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {contact.fax || <span className="text-slate-300 font-normal">--</span>}
                      </span>
                    </div>
                  </div>

                  {/* Columna Notas / Cargo */}
                  <div className="w-full flex-1 lg:min-w-[200px] text-xs space-y-1.5">
                    {contact.cargo && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Cargo / Enlace:
                        </span>
                        <div className="font-mono text-[11px] text-slate-700 break-words">
                          {contact.cargo.startsWith('http') ? (
                            <a
                              href={contact.cargo}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 font-sans font-medium break-all"
                            >
                              <span>{contact.cargo}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            contact.cargo
                          )}
                        </div>
                      </div>
                    )}

                    {contact.informacionAdicional ? (
                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2 text-[11px] text-slate-700">
                        <span className="font-bold text-amber-900 block text-[10px] uppercase">Información / Notas:</span>
                        <p className="line-clamp-2 sm:line-clamp-3">{contact.informacionAdicional}</p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[11px] italic block">Sin información adicional</span>
                    )}
                  </div>

                  {/* Columna Derecha / Footer Móvil: Botones de Acción */}
                  <div className="flex items-center justify-between sm:justify-end lg:flex-col xl:flex-row gap-1.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto shrink-0">
                    <button
                      onClick={() => handlePrintSingle(contact)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer min-h-[38px]"
                      title="Imprimir ficha directamente"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir</span>
                    </button>

                    <button
                      onClick={() => ExportService.exportToPdf('agenda', contact)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      title="Descargar Ficha en PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicateRecord(contact)}
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      title="Duplicar este registro"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleEditRecord(contact)}
                      className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      title="Editar este registro en el formulario"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteCandidate(contact)}
                      className="p-2 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      title="Eliminar este registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'table' ? (
            /* ========================================================================= */
            /* VISTA EN TABLA (CON ADAPTACIÓN MÓVIL A 1 COLUMNA)                          */
            /* ========================================================================= */
            <>
              {/* Versión Tarjetas 1 Columna en Móvil (< md) */}
              <div className="md:hidden space-y-3.5 w-full">
                {paginatedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 w-full"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="bg-slate-900 text-emerald-400 font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                        ID #{contact.agendaId}
                      </span>
                      {contact.organizacion && (
                        <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">
                          {contact.organizacion}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{contact.nombre}</h4>
                      {contact.cargo && (
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{contact.cargo}</p>
                      )}
                      {contact.correoElectronico && (
                        <p className="text-xs text-emerald-700 mt-0.5">{contact.correoElectronico}</p>
                      )}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      {contact.telefono && (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Tel:
                          </span>
                          <span className="font-bold">
                            {contact.telefono} {contact.extension ? `(Ext: ${contact.extension})` : ''}
                          </span>
                        </div>
                      )}
                      {contact.movil && (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Smartphone className="w-3 h-3" /> Móvil:
                          </span>
                          <span className="font-bold">{contact.movil}</span>
                        </div>
                      )}
                    </div>

                    {contact.informacionAdicional && (
                      <div className="bg-amber-50/70 border border-amber-200/50 p-2 rounded-xl text-[11px] text-slate-700">
                        <span className="font-bold text-amber-900 block uppercase text-[9px]">Notas:</span>
                        <p className="line-clamp-2">{contact.informacionAdicional}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handlePrintSingle(contact)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir</span>
                      </button>
                      <button
                        onClick={() => ExportService.exportToPdf('agenda', contact)}
                        className="p-2 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRecord(contact)}
                        className="p-2 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRecord(contact)}
                        className="p-2 text-slate-600 hover:text-amber-700 border border-slate-200 rounded-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(contact)}
                        className="p-2 text-slate-600 hover:text-rose-700 border border-slate-200 rounded-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Versión Tabla en Pantallas Medianas / Grandes (md:) */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Id</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Organización</th>
                        <th className="px-4 py-3">Teléfono / Ext</th>
                        <th className="px-4 py-3">Móvil / Fax</th>
                        <th className="px-4 py-3">Cargo / Web</th>
                        <th className="px-4 py-3">Info Adicional</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                              #{contact.agendaId}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-extrabold text-slate-900">
                            {contact.nombre}
                            {contact.correoElectronico && (
                              <div className="text-[11px] font-normal text-slate-500">{contact.correoElectronico}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {contact.organizacion || '--'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>{contact.telefono || '--'}</div>
                            {contact.extension && (
                              <span className="text-slate-500 text-[10px]">Ext: {contact.extension}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>{contact.movil || '--'}</div>
                            {contact.fax && <span className="text-slate-500 text-[10px]">Fax: {contact.fax}</span>}
                          </td>
                          <td className="px-4 py-3 max-w-[180px] truncate font-mono text-[11px]">
                            {contact.cargo || '--'}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-[11px]">
                            {contact.informacionAdicional || '--'}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handlePrintSingle(contact)}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                title="Imprimir directamente"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => ExportService.exportToPdf('agenda', contact)}
                                className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Descargar PDF"
                              >
                                <FileDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateRecord(contact)}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                title="Duplicar"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditRecord(contact)}
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                                title="Editar en formulario"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteCandidate(contact)}
                                className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* ========================================================================= */
            /* VISTA EN CUADRÍCULA (1 COLUMNA EN MÓVIL, 2 EN TABLET, 3 EN ESCRITORIO)    */
            /* ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full">
              {paginatedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group w-full"
                >
                  {/* Cabecera de Tarjeta */}
                  <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md tracking-wider shrink-0 font-mono">
                        ID #{contact.agendaId}
                      </span>
                      {contact.organizacion && (
                        <span className="text-[11px] font-semibold text-slate-300 truncate">
                          {contact.organizacion}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePrintSingle(contact)}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Imprimir directamente"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => ExportService.exportToPdf('agenda', contact)}
                        className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRecord(contact)}
                        className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRecord(contact)}
                        className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar en formulario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(contact)}
                        className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo de Tarjeta en 1 columna */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug break-words">
                        {contact.nombre}
                      </h4>
                      {contact.cargo && (
                        <p className="text-xs text-slate-500 font-mono mt-1 break-words">
                          {contact.cargo}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      {contact.telefono && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{contact.telefono}</span>
                          {contact.extension && (
                            <span className="text-[11px] bg-slate-200 text-slate-700 px-1 rounded font-medium">
                              Ext: {contact.extension}
                            </span>
                          )}
                        </div>
                      )}
                      {contact.movil && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{contact.movil}</span>
                        </div>
                      )}
                      {contact.correoElectronico && (
                        <div className="flex items-center gap-2 text-slate-700 break-all">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="break-all">{contact.correoElectronico}</span>
                        </div>
                      )}
                    </div>

                    {contact.informacionAdicional && (
                      <div className="text-[11px] text-slate-600 bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl">
                        <span className="font-bold text-amber-900 block text-[10px] uppercase">Notas:</span>
                        <p className="line-clamp-3">{contact.informacionAdicional}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Barra de Paginación Inferior (10 en 10) */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Página <b className="text-slate-900">{validCurrentPage}</b> de <b className="text-slate-900">{totalPages}</b> • Bloques de 10 registros
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de Página */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - validCurrentPage) <= 1
                      );
                    })
                    .map((page, idx, array) => {
                      const prev = array[idx - 1];
                      const showEllipsis = prev && page - prev > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              validCurrentPage === page
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Página siguiente"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN PERMANENTE                           */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Eliminar registro de la agenda?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Estás a punto de eliminar el registro <b>Id #{deleteCandidate.agendaId}</b> ({deleteCandidate.nombre}). Esta acción es permanente y no se podrá deshacer.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
