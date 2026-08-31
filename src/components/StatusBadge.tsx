import React from 'react';
import { StatusType } from '../types';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'Nuevo':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'En Diagnóstico':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Presupuestado':
      case 'Esperando Aprobación':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'En Reparación':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Esperando Refacciones':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Listo para Entrega':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Entregado / Cerrado':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Cancelado':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Garantía':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </span>
  );
};
