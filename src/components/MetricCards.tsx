import React from 'react';
import { DatabaseState } from '../types/database';
import { calcularAntiguedad } from '../utils/academicHelpers';

interface MetricCardsProps {
  db: DatabaseState;
  onNavigateToTab?: (tab: 'malla' | 'directorio' | 'analitica' | 'gestion') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ db, onNavigateToTab }) => {
  const totalProfesores = db.profesores.length;

  const avgAlumnos =
    totalProfesores > 0
      ? (
          db.profesores.reduce((sum, p) => sum + p.calificacionAlumnos, 0) /
          totalProfesores
        ).toFixed(1)
      : '0.0';

  const avgCoord =
    totalProfesores > 0
      ? (
          db.profesores.reduce((sum, p) => sum + p.calificacionCoordinacion, 0) /
          totalProfesores
        ).toFixed(1)
      : '0.0';

  // Antigüedad promedio en años
  const avgAntiguedadAnios =
    totalProfesores > 0
      ? (
          db.profesores.reduce((sum, p) => {
            const ant = calcularAntiguedad(p.fechaIngreso);
            return sum + ant.totalMeses / 12;
          }, 0) / totalProfesores
        ).toFixed(1)
      : '0.0';

  // Profesores por debajo de lo aceptable (< 9.0)
  const totalDebajoAceptable = db.profesores.filter((p) => {
    const avg = (p.calificacionAlumnos + p.calificacionCoordinacion) / 2;
    return avg < 9.0;
  }).length;

  // Profesores en Foco Rojo (<= 7.0)
  const totalFocoRojo = db.profesores.filter((p) => {
    const avg = (p.calificacionAlumnos + p.calificacionCoordinacion) / 2;
    return avg <= 7.0 || p.calificacionAlumnos <= 7.0 || p.calificacionCoordinacion <= 7.0;
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="block text-xs font-medium text-slate-500 mb-1">
          Docentes Activos
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {totalProfesores}
          </span>
          <span className="text-xs text-slate-500">profesores</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          En plantilla institucional
        </div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="block text-xs font-medium text-slate-500 mb-1">
          Calif. Alumnos Media
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
            {avgAlumnos}
          </span>
          <span className="text-xs text-slate-500 font-mono">/ 10</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Encuestas de satisfacción
        </div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="block text-xs font-medium text-slate-500 mb-1">
          Calif. Coordinación
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-blue-700 font-mono tabular-nums">
            {avgCoord}
          </span>
          <span className="text-xs text-slate-500 font-mono">/ 10</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Auditoría de actas y claustros
        </div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="block text-xs font-medium text-slate-500 mb-1">
          Antigüedad Media
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {avgAntiguedadAnios}
          </span>
          <span className="text-xs text-slate-500">años</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Trayectoria institucional
        </div>
      </div>

      {/* Requieren Capacitación (< 9) */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('analitica')}
        className={`bg-white p-3.5 sm:p-4 rounded-xl border border-amber-200 shadow-2xs transition-all ${
          onNavigateToTab ? 'cursor-pointer hover:border-amber-400 hover:shadow-md' : ''
        }`}
        title={onNavigateToTab ? 'Ver desglose completo en Analítica' : undefined}
      >
        <span className="block text-xs font-bold text-amber-800 mb-1">
          Capacitación (&lt; 9.0)
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
            {totalDebajoAceptable}
          </span>
          <span className="text-xs text-amber-700 font-medium">docentes</span>
        </div>
        <div className="mt-2 text-[11px] text-amber-800 flex items-center justify-between">
          <span>Por debajo de lo aceptable</span>
          {onNavigateToTab && <span className="text-[10px] underline font-medium">Ver</span>}
        </div>
      </div>

      {/* Foco Rojo (<= 7.0) */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('analitica')}
        className={`bg-rose-50/80 p-3.5 sm:p-4 rounded-xl border-2 border-rose-300 shadow-2xs transition-all ${
          onNavigateToTab ? 'cursor-pointer hover:border-rose-500 hover:shadow-md' : ''
        }`}
        title={onNavigateToTab ? 'Ver auditoría de Foco Rojo en Analítica' : undefined}
      >
        <span className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse inline-block" />
          Foco Rojo (≤ 7.0)
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-rose-700 font-mono tabular-nums">
            {totalFocoRojo}
          </span>
          <span className="text-xs text-rose-800 font-bold">críticos</span>
        </div>
        <div className="mt-2 text-[11px] text-rose-700 font-medium flex items-center justify-between">
          <span>Intervención urgente</span>
          {onNavigateToTab && <span className="text-[10px] underline font-bold">Auditar</span>}
        </div>
      </div>
    </div>
  );
};
