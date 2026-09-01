import React, { useState, useMemo } from 'react';
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
  LayoutGrid,
  Table as TableIcon,
  Smartphone,
  FileSpreadsheet,
  FileDown,
  ExternalLink,
  Hash,
} from 'lucide-react';
import { AgendaContact, CompanyInfo } from '../types';
import { StorageService } from '../lib/storage';
import { ExportService } from '../lib/exportUtils';

export const AgendaModule: React.FC<{ company: CompanyInfo }> = ({ company }) => {
  const [contacts, setContacts] = useState<AgendaContact[]>(() => StorageService.getAgenda());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaContact | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AgendaContact | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State - sin campos de categoría ni clasificación
  const initialFormState: Partial<AgendaContact> = {
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
  };

  const [formData, setFormData] = useState<Partial<AgendaContact>>(initialFormState);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper de Impresión Directa e Inmediata (Iframe invisible + llamada a la impresora)
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

  // Open New Contact Modal
  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      agendaId: StorageService.getNextAgendaId(),
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (contact: AgendaContact) => {
    setEditingItem(contact);
    setFormData({ ...contact });
    setIsModalOpen(true);
  };

  // Save Contact (Create / Update)
  const handleSaveRecord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.nombre?.trim()) {
      showToast('⚠️ Por favor ingresa el Nombre del contacto o programa.');
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
    setIsModalOpen(false);
    showToast(
      editingItem
        ? `✅ Registro Id #${recordToSave.agendaId} actualizado correctamente.`
        : `✅ Nuevo registro Id #${recordToSave.agendaId} guardado con éxito.`
    );
  };

  // Duplicate Contact
  const handleDuplicateRecord = (contact: AgendaContact) => {
    const { list, duplicated } = StorageService.duplicateAgendaContact(contact.id);
    setContacts(list);
    if (duplicated) {
      showToast(`📋 Registro Id #${contact.agendaId} duplicado exitosamente como Id #${duplicated.agendaId}.`);
    }
  };

  // Delete Contact
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const updatedList = StorageService.deleteAgendaContact(deleteCandidate.id);
    setContacts(updatedList);
    showToast(`🗑️ Registro Id #${deleteCandidate.agendaId} eliminado.`);
    setDeleteCandidate(null);
  };

  // Imprimir Ficha Individual: Manda a imprimir directamente (Abre impresora en 1 clic)
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

  // Export CSV
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

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        c.agendaId.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        c.organizacion.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        c.extension.toLowerCase().includes(q) ||
        c.movil.toLowerCase().includes(q) ||
        c.fax.toLowerCase().includes(q) ||
        c.correoElectronico.toLowerCase().includes(q) ||
        c.cargo.toLowerCase().includes(q) ||
        c.informacionAdicional.toLowerCase().includes(q)
      );
    });
  }, [contacts, searchQuery]);

  return (
    <div className="space-y-6">
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

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Módulo
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <BookUser className="w-6 h-6 text-emerald-600" />
            Agenda
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Directorio institucional, proveedores, programas técnicos y contactos operativos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón: Agregar un nuevo registro */}
          <button
            onClick={handleOpenNew}
            id="btn-agregar-registro"
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Crear un nuevo registro en la agenda"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Registro</span>
          </button>

          {/* Botón: Imprimir Directorio Completo Directamente */}
          <button
            onClick={handlePrintAll}
            id="btn-imprimir-directorio"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-slate-200"
            title="Imprimir todos los registros de la agenda directamente"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Imprimir Agenda</span>
          </button>

          {/* Botón: Exportar CSV */}
          <button
            onClick={handleExportCSV}
            id="btn-exportar-csv"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Exportar a CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Toggle View Mode */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Tabla"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Buscador de registros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Input Buscador */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="buscador-registros-agenda"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscador de registros (Buscar por Id, Nombre, Organización, Teléfono, Cargo, Dirección o Notas)..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Mostrando <b>{filteredContacts.length}</b> de <b>{contacts.length}</b> registros en agenda
          </span>
          {searchQuery && (
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
              Filtro activo: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <BookUser className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron registros</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otros términos o limpia el buscador.`
              : 'La agenda está vacía. Haz clic en "Agregar Registro" para capturar el primero.'}
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium text-xs hover:bg-emerald-700 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Primer Registro</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid de Tarjetas Modernas y Responsivas */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Header Top */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md tracking-wider">
                    ID #{contact.agendaId}
                  </span>
                  {contact.organizacion && (
                    <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[140px] sm:max-w-[170px]">
                      {contact.organizacion}
                    </span>
                  )}
                </div>

                {/* Card Top Action Icons */}
                <div className="flex items-center gap-1">
                  {/* Botón Imprimir Directo (Abre la impresora directamente sin ventana flotante) */}
                  <button
                    onClick={() => handlePrintSingle(contact)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Imprimir directamente este registro"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {/* Botón Descargar PDF Oficial */}
                  <button
                    onClick={() => ExportService.exportToPdf('agenda', contact)}
                    className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Descargar Ficha en PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  {/* Botón Duplicar */}
                  <button
                    onClick={() => handleDuplicateRecord(contact)}
                    className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Duplicar este registro"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {/* Botón Editar */}
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Editar este registro"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {/* Botón Eliminar */}
                  <button
                    onClick={() => setDeleteCandidate(contact)}
                    className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar este registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nombre Principal */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Nombre / Contacto
                </span>
                <h3 className="font-black text-base text-slate-900 leading-snug tracking-tight">
                  {contact.nombre}
                </h3>
              </div>

              {/* Body Fields */}
              <div className="p-4 space-y-3 flex-1 text-xs">
                {/* Teléfonos y Extensiones */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> Teléfono:
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {contact.telefono || <span className="text-slate-400 font-normal">--</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">Extensión:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {contact.extension || <span className="text-slate-400 font-normal">--</span>}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-slate-400" /> Móvil:
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {contact.movil || <span className="text-slate-400 font-normal">--</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">Fax:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {contact.fax || <span className="text-slate-400 font-normal">--</span>}
                    </span>
                  </div>
                </div>

                {/* Correo Electrónico */}
                {contact.correoElectronico && (
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{contact.correoElectronico}</span>
                  </div>
                )}

                {/* Organización */}
                {contact.organizacion && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Organización / Área:
                    </span>
                    <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{contact.organizacion}</span>
                    </div>
                  </div>
                )}

                {/* Cargo / Enlace */}
                {contact.cargo && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Cargo / Enlace:
                    </span>
                    <div className="text-slate-700 mt-0.5 break-all font-mono text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {contact.cargo.startsWith('http') ? (
                        <a
                          href={contact.cargo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-sans font-medium"
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

                {/* Información Adicional */}
                {contact.informacionAdicional && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Información Adicional / Ubicación:
                    </span>
                    <p className="text-[11px] text-slate-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed font-medium">
                      {contact.informacionAdicional}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
                <button
                  onClick={() => handleDuplicateRecord(contact)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  title="Duplicar registro"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => handlePrintSingle(contact)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Mandar a imprimir directamente"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista en Tabla */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                {filteredContacts.map((contact) => (
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
                          onClick={() => handleOpenEdit(contact)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                          title="Editar"
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: FORMULARIO AGREGAR / EDITAR / GUARDAR REGISTRO                     */}
      {/* (Sin campos de categoría ni clasificación según solicitud)                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <BookUser className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg tracking-tight">
                    {editingItem ? 'Editar Registro' : 'Nuevo Registro en Agenda'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Captura los datos del contacto o programa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveRecord} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Campo: Id */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" />
                  Id / Número de Registro *
                </label>
                <input
                  type="text"
                  required
                  value={formData.agendaId || ''}
                  onChange={(e) => setFormData({ ...formData, agendaId: e.target.value })}
                  className="w-full sm:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  placeholder="Ej. 1, 2, 3..."
                />
              </div>

              {/* Campo: Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. LG ELECTRONICS PLANTA MÉXICO S.A. DE C.V."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              {/* Fila: Teléfono y Extensión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej. (55) 5321-1900"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Extensión
                  </label>
                  <input
                    type="text"
                    value={formData.extension || ''}
                    onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    placeholder="Ej. 1420"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Fila: Móvil y Fax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Móvil (Celular)
                  </label>
                  <input
                    type="text"
                    value={formData.movil || ''}
                    onChange={(e) => setFormData({ ...formData, movil: e.target.value })}
                    placeholder="Ej. (55) 8412-9901"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fax
                  </label>
                  <input
                    type="text"
                    value={formData.fax || ''}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    placeholder="Ej. (55) 5321-1999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.correoElectronico || ''}
                  onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                  placeholder="Ej. soporte.partes@lge.com.mx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Organización */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Organización
                </label>
                <input
                  type="text"
                  value={formData.organizacion || ''}
                  onChange={(e) => setFormData({ ...formData, organizacion: e.target.value })}
                  placeholder="Ej. LG ELECTRONICS MÉXICO (DEPARTAMENTO DE PARTES)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 text-sm focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Cargo / Enlace
                </label>
                <input
                  type="text"
                  value={formData.cargo || ''}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ej. Gerencia Nacional de Refacciones o URL"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              {/* Información Adicional */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Información Adicional
                </label>
                <textarea
                  rows={3}
                  value={formData.informacionAdicional || ''}
                  onChange={(e) => setFormData({ ...formData, informacionAdicional: e.target.value })}
                  placeholder="Ej. PASEO RIO SONORA #72 % GALEANA Y REFORMA A UN LADO DEL PALOMINO EN EL CENTRO DE GOBIERNO ****"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none resize-y"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>

                {/* BOTÓN: GUARDAR REGISTRO */}
                <button
                  type="submit"
                  id="btn-guardar-registro"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINAR REGISTRO                                   */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¿Eliminar este registro?</h3>
            <p className="text-sm text-slate-500 mt-1">
              Estás a punto de eliminar el registro <b>Id #{deleteCandidate.agendaId}</b> (
              {deleteCandidate.nombre}). Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
