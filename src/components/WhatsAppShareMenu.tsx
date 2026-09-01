import React, { useState, useRef, useEffect } from 'react';
import { Share2, MessageSquare, FileDown, Check, Loader2 } from 'lucide-react';
import { ModuleType, AnyRecord, CompanyInfo } from '../types';
import { shareRecordToWhatsApp, sharePdfToWhatsApp } from '../lib/whatsappUtils';

interface WhatsAppShareMenuProps {
  module: ModuleType;
  record: AnyRecord;
  company: CompanyInfo;
  variant?: 'button' | 'icon' | 'toolbar';
  className?: string;
}

export const WhatsAppShareMenu: React.FC<WhatsAppShareMenuProps> = ({
  module,
  record,
  company,
  variant = 'button',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleShareText = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareRecordToWhatsApp(module, record, company);
    setIsOpen(false);
  };

  const handleSharePdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharingPdf(true);
    try {
      await sharePdfToWhatsApp(module, record, company);
    } finally {
      setIsSharingPdf(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* Botón Disparador según variante */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-200/80 shadow-2xs"
          title="Compartir a WhatsApp (Texto o PDF)"
          aria-label="Compartir a WhatsApp"
        >
          {/* Official WhatsApp icon shape */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Compartir a WhatsApp"
        >
          <svg className="w-3.5 h-3.5 fill-current text-emerald-600" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>WhatsApp</span>
        </button>
      )}

      {variant === 'toolbar' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          title="Compartir orden por WhatsApp"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>Compartir WhatsApp</span>
        </button>
      )}

      {/* Menú Desplegable con Efecto Suave */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 text-xs">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 rounded-t-xl mb-1">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Compartir a WhatsApp
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">Elige el formato de envío para el cliente</p>
          </div>

          <button
            type="button"
            onClick={handleShareText}
            className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block group-hover:text-emerald-800">
                Enviar Ficha de Texto
              </span>
              <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                Mensaje rápido con cliente, datos de equipo y desglose.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleSharePdf}
            disabled={isSharingPdf}
            className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              {isSharingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-slate-900 block group-hover:text-blue-800">
                Compartir Documento PDF
              </span>
              <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                Genera el PDF membretado oficial y lo adjunta/descarga.
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
