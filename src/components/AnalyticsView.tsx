import React, { useState } from 'react';
import { 
  Trophy, 
  Clock, 
  AlertOctagon, 
  AlertTriangle, 
  BarChart2, 
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  Filter,
  FileText,
  UserX,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DatabaseState, Profesor } from '../types/database';
import { 
  calcularAntiguedad, 
  formatearCalificacion, 
  MODALIDADES_CATALOGO, 
  obtenerCategoriaDesempeno,
  obtenerDiagnosticoYCapacitacion 
} from '../utils/academicHelpers';

interface AnalyticsViewProps {
  db: DatabaseState;
  onSelectProfesor: (profesor: Profesor) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  db,
  onSelectProfesor,
}) => {
  // Filtro interno para la sección de capacitación
  const [filtroCapacitacion, setFiltroCapacitacion] = useState<'todos' | 'foco_rojo' | 'preventivo'>('todos');

  // Profesores en FOCO ROJO: Calificación igual o menor a 7 (promedio <= 7.0 o alguna de las dos <= 7.0)
  const profesoresFocoRojo = db.profesores.filter((p) => {
    const avg = (p.calificacionAlumnos + p.calificacionCoordinacion) / 2;
    return avg <= 7.0 || p.calificacionAlumnos <= 7.0 || p.calificacionCoordinacion <= 7.0;
  });

  // Profesores por debajo de lo aceptable (calificación < 9.0) que requieran reforzar su capacitación
  const profesoresRequierenCapacitacion = db.profesores.filter((p) => {
    const avg = (p.calificacionAlumnos + p.calificacionCoordinacion) / 2;
    return avg < 9.0 || p.calificacionAlumnos < 9.0 || p.calificacionCoordinacion < 9.0;
  }).sort((a, b) => {
    const avgA = (a.calificacionAlumnos + a.calificacionCoordinacion) / 2;
    const avgB = (b.calificacionAlumnos + b.calificacionCoordinacion) / 2;
    return avgA - avgB; // menor calificación primero
  });

  // Profesores que están entre 7.1 y 8.9 (capacitación preventiva)
  const capacitacionPreventiva = profesoresRequierenCapacitacion.filter(
    (p) => !profesoresFocoRojo.some((f) => f.id === p.id)
  );

  // Profesores en nivel aceptable o excelente (>= 9.0)
  const profesoresOptimos = db.profesores.filter(
    (p) => !profesoresRequierenCapacitacion.some((r) => r.id === p.id)
  );

  // Lista según filtro seleccionado en capacitación
  const listaCapacitacionFiltrada =
    filtroCapacitacion === 'foco_rojo'
      ? profesoresFocoRojo
      : filtroCapacitacion === 'preventivo'
      ? capacitacionPreventiva
      : profesoresRequierenCapacitacion;

  // Promedio institucional global
  const promedioGeneralInstitucional =
    db.profesores.length > 0
      ? (
          db.profesores.reduce(
            (sum, p) => sum + (p.calificacionAlumnos + p.calificacionCoordinacion) / 2,
            0
          ) / db.profesores.length
        ).toFixed(2)
      : '0.00';

  // Top 5 calificados
  const topCalificados = [...db.profesores]
    .sort((a, b) => {
      const avgA = (a.calificacionAlumnos + a.calificacionCoordinacion) / 2;
      const avgB = (b.calificacionAlumnos + b.calificacionCoordinacion) / 2;
      return avgB - avgA;
    })
    .slice(0, 5);

  // Top 5 antigüedad
  const topAntiguedad = [...db.profesores]
    .sort((a, b) => {
      const antA = calcularAntiguedad(a.fechaIngreso).totalMeses;
      const antB = calcularAntiguedad(b.fechaIngreso).totalMeses;
      return antB - antA;
    })
    .slice(0, 5);

  // Desglose por modalidad
  const gruposEscolarizado = db.grupos.filter((g) => g.modalidad === 'escolarizado').length;
  const gruposEjecutivo = db.grupos.filter((g) => g.modalidad === 'ejecutivo').length;
  const gruposDistancia = db.grupos.filter((g) => g.modalidad === 'a_distancia').length;

  const asigEscolarizado = db.asignaciones.filter((a) => a.modalidad === 'escolarizado').length;
  const asigEjecutivo = db.asignaciones.filter((a) => a.modalidad === 'ejecutivo').length;
  const asigDistancia = db.asignaciones.filter((a) => a.modalidad === 'a_distancia').length;

  // Promedios por rubro
  const rubrosAlumnos = [
    {
      nombre: 'Dominio del Tema',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesAlumnos.dominioTema, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Claridad en la Exposición',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesAlumnos.claridadExposicion, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Puntualidad y Asistencia',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesAlumnos.puntualidadAsistencia, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Retroalimentación de Tareas',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesAlumnos.retroalimentacion, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Empatía y Respeto en Clase',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesAlumnos.empatiaYRespeto, 0) /
        db.profesores.length
      ).toFixed(2),
    },
  ];

  const rubrosCoord = [
    {
      nombre: 'Entrega de Planeaciones Didácticas',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesCoordinacion.entregaPlaneaciones, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Asistencia a Claustros y Juntas',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesCoordinacion.asistenciaClaustros, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Avance Programático Oficial',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesCoordinacion.avanceProgramatico, 0) /
        db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Subida Oportuna de Actas de Examen',
      promedio: (
        db.profesores.reduce(
          (s, p) => s + p.detallesCoordinacion.subidaCalificacionesTiempo,
          0
        ) / db.profesores.length
      ).toFixed(2),
    },
    {
      nombre: 'Innovación y Recursos Didácticos',
      promedio: (
        db.profesores.reduce((s, p) => s + p.detallesCoordinacion.innovacionDidactica, 0) /
        db.profesores.length
      ).toFixed(2),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* BANNER EJECUTIVO DE CONTROL: KPIs DE EVALUACIÓN Y ALERTAS       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL EN FOCO ROJO (Calificación <= 7.0) */}
        <div className="bg-rose-50 border-2 border-rose-400/90 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
              Total en Foco Rojo (≤ 7.0)
            </span>
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Crítico
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-rose-700 tabular-nums">
              {profesoresFocoRojo.length}
            </span>
            <span className="text-xs font-semibold text-rose-800">
              {profesoresFocoRojo.length === 1 ? 'docente en alerta' : 'docentes en alerta'}
            </span>
          </div>

          <p className="text-[11px] text-rose-800 mt-2 leading-relaxed">
            Docentes con calificación ≤ 7.0 otorgada por alumnos o coordinación. Requieren citatorio y plan correctivo.
          </p>
        </div>

        {/* KPI 2: TOTAL QUE REQUIEREN REFORZAR CAPACITACIÓN (< 9.0) */}
        <div className="bg-amber-50 border-2 border-amber-400/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Requieren Capacitación (&lt; 9.0)
            </span>
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Refuerzo
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-amber-800 tabular-nums">
              {profesoresRequierenCapacitacion.length}
            </span>
            <span className="text-xs font-semibold text-amber-800">
              docentes ({((profesoresRequierenCapacitacion.length / db.profesores.length) * 100).toFixed(0)}% plantilla)
            </span>
          </div>

          <p className="text-[11px] text-amber-800 mt-2 leading-relaxed">
            Docentes por debajo de la meta de excelencia (9.0). Canalizados al Programa de Fortalecimiento Docente.
          </p>
        </div>

        {/* KPI 3: DOCENTES CON DESEMPEÑO ACEPTABLE / SOBRESALIENTE (>= 9.0) */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Nivel de Excelencia (≥ 9.0)
            </span>
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Aceptable
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-emerald-800 tabular-nums">
              {profesoresOptimos.length}
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              docentes acreditados
            </span>
          </div>

          <p className="text-[11px] text-emerald-800 mt-2 leading-relaxed">
            Docentes que cumplen satisfactoriamente el estándar de calidad institucional de 9.0 o superior.
          </p>
        </div>

        {/* KPI 4: PROMEDIO GENERAL INSTITUCIONAL */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Calificación Promedio Global
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Escala 0-10
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-white tabular-nums">
              {promedioGeneralInstitucional}
            </span>
            <span className="text-xs text-slate-400">/ 10 puntos</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Consolidado institucional ponderado entre alumnos ({((db.profesores.reduce((s, p) => s + p.calificacionAlumnos, 0) / db.profesores.length)).toFixed(1)}) y coordinación ({((db.profesores.reduce((s, p) => s + p.calificacionCoordinacion, 0) / db.profesores.length)).toFixed(1)}).
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 1: AUDITORÍA DE FOCO ROJO (Calificación <= 7.0)          */}
      {/* ============================================================== */}
      <div className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-rose-950 uppercase tracking-tight">
                  Auditoría de Docentes en Foco Rojo (Calificación ≤ 7.0)
                </h3>
                <span className="bg-rose-700 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                  TOTAL: {profesoresFocoRojo.length} {profesoresFocoRojo.length === 1 ? 'DOCENTE' : 'DOCENTES'}
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-1 max-w-3xl">
                Profesores que presentan una calificación promedio o parcial igual o menor a 7.0 puntos (otorgada por alumnos o por la coordinación escolar). Requieren <strong>citatorio inmediato a la dirección</strong>, plan de contingencia pedagógica y seguimiento especial.
              </p>
            </div>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl border border-rose-300 text-right shrink-0 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">
              Total Foco Rojo
            </span>
            <div className="text-3xl font-extrabold font-mono text-rose-700 tabular-nums">
              {profesoresFocoRojo.length}{' '}
              <span className="text-xs font-semibold text-rose-900">
                / {db.profesores.length}
              </span>
            </div>
            <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
              {((profesoresFocoRojo.length / db.profesores.length) * 100).toFixed(1)}% de la plantilla
            </span>
          </div>
        </div>

        {profesoresFocoRojo.length === 0 ? (
          <div className="py-8 text-center text-xs text-rose-900 font-semibold bg-white/70 rounded-xl border border-rose-200">
            ¡Sin incidentes críticos! Ningún docente tiene calificación igual o menor a 7.0 en este ciclo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profesoresFocoRojo.map((prof) => {
              const antiguedad = calcularAntiguedad(prof.fechaIngreso);
              const promedio = Number(
                ((prof.calificacionAlumnos + prof.calificacionCoordinacion) / 2).toFixed(1)
              );
              const asignacionesProf = db.asignaciones.filter((a) => a.profesorId === prof.id);
              const diagnostico = obtenerDiagnosticoYCapacitacion(
                prof.calificacionAlumnos,
                prof.calificacionCoordinacion,
                prof.detallesAlumnos,
                prof.detallesCoordinacion
              );

              return (
                <div
                  key={prof.id}
                  className="bg-white rounded-xl border-2 border-rose-300 p-4 shadow-sm space-y-3.5 relative"
                >
                  {/* Top Bar of Professor Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                          FOCO ROJO
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Cédula: {prof.cedula}
                        </span>
                      </div>
                      <button
                        onClick={() => onSelectProfesor(prof)}
                        className="text-base font-bold text-slate-900 hover:text-rose-600 hover:underline text-left block mt-1 transition-colors"
                      >
                        {prof.nombre}
                      </button>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        {prof.especialidad}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Antigüedad: {antiguedad.texto}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-black font-mono text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-300 tabular-nums">
                        {promedio.toFixed(1)}{' '}
                        <span className="text-xs font-normal text-rose-500">/ 10</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-rose-700 block mt-1">
                        Promedio Crítico
                      </span>
                    </div>
                  </div>

                  {/* Comparativa detallada de Alumnos vs Coordinación */}
                  <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-rose-50/60 rounded-xl border border-rose-200 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Encuesta Alumnos:</span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
                            prof.calificacionAlumnos <= 7.0
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {formatearCalificacion(prof.calificacionAlumnos)} / 10
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                        <div>Puntualidad: {prof.detallesAlumnos.puntualidadAsistencia}</div>
                        <div>Claridad: {prof.detallesAlumnos.claridadExposicion}</div>
                      </div>
                    </div>

                    <div className="space-y-1 border-l border-rose-200 pl-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Coordinación:</span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
                            prof.calificacionCoordinacion <= 7.0
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {formatearCalificacion(prof.calificacionCoordinacion)} / 10
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                        <div>Planeaciones: {prof.detallesCoordinacion.entregaPlaneaciones}</div>
                        <div>Actas Examen: {prof.detallesCoordinacion.subidaCalificacionesTiempo}</div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico y Dictamen */}
                  <div className="bg-rose-100/60 p-2.5 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
                    <div className="text-[11px] font-bold flex items-center gap-1 text-rose-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                      <span>Motivo del Foco Rojo:</span>
                    </div>
                    <p className="text-[11px] text-rose-900 leading-snug">
                      {prof.observacionesCoordinacion || diagnostico.areaDebil}
                    </p>
                  </div>

                  {/* Asignación a Plan de Capacitación Urgente */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                      Módulo de Capacitación Correctiva:
                    </span>
                    <div className="text-xs font-semibold text-slate-800">
                      [{diagnostico.codigoModulo}] {diagnostico.moduloRecomendado}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-600 font-mono">
                      Grupos asignados: <strong>{asignacionesProf.length}</strong>
                    </span>

                    <button
                      onClick={() => onSelectProfesor(prof)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Expediente y Citatorio</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 2: DOCENTES POR DEBAJO DE LO ACEPTABLE (< 9.0)          */}
      {/* REFUERZO Y CAPACITACIÓN INSTITUCIONAL                           */}
      {/* ============================================================== */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-amber-950 uppercase tracking-tight">
                  Docentes por Debajo de lo Aceptable (&lt; 9.0 de Calificación)
                </h3>
                <span className="bg-amber-600 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                  PLAN DE CAPACITACIÓN ({profesoresRequierenCapacitacion.length} DOCENTES)
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 max-w-3xl">
                El estándar institucional de acreditación y calidad académica requiere una calificación mínima de <strong>9.0 sobre 10</strong>. Todos los docentes con promedio inferior a 9.0 son incorporados a talleres de actualización pedagógica, diseño de rúbricas y planeación.
              </p>
            </div>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl border border-amber-300 text-right shrink-0 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
              Total a Capacitar (&lt; 9.0)
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-800 tabular-nums">
              {profesoresRequierenCapacitacion.length}
            </div>
            <span className="text-[10px] font-bold text-amber-700 block mt-0.5">
              Incluye foco rojo y refuerzo
            </span>
          </div>
        </div>

        {/* Selector de pestañas / Filtro dentro de la lista de capacitación */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setFiltroCapacitacion('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filtroCapacitacion === 'todos'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Todos por Debajo de 9.0</span>
            <span className="bg-black/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {profesoresRequierenCapacitacion.length}
            </span>
          </button>

          <button
            onClick={() => setFiltroCapacitacion('foco_rojo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filtroCapacitacion === 'foco_rojo'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-white text-rose-800 border border-rose-300 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            <span>Foco Rojo Crítico (≤ 7.0)</span>
            <span className="bg-black/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {profesoresFocoRojo.length}
            </span>
          </button>

          <button
            onClick={() => setFiltroCapacitacion('preventivo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filtroCapacitacion === 'preventivo'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span>Refuerzo Pedagógico (7.1 a 8.9)</span>
            <span className="bg-black/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {capacitacionPreventiva.length}
            </span>
          </button>
        </div>

        {/* Tabla / Lista de Docentes para Capacitación */}
        {listaCapacitacionFiltrada.length === 0 ? (
          <div className="py-8 text-center text-xs text-amber-900 font-semibold bg-white/70 rounded-xl border border-amber-200">
            No hay docentes registrados en esta categoría de capacitación.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {listaCapacitacionFiltrada.map((prof, index) => {
              const antiguedad = calcularAntiguedad(prof.fechaIngreso);
              const promedio = Number(
                ((prof.calificacionAlumnos + prof.calificacionCoordinacion) / 2).toFixed(1)
              );
              const esFocoRojo =
                promedio <= 7.0 || prof.calificacionAlumnos <= 7.0 || prof.calificacionCoordinacion <= 7.0;
              const diagnostico = obtenerDiagnosticoYCapacitacion(
                prof.calificacionAlumnos,
                prof.calificacionCoordinacion,
                prof.detallesAlumnos,
                prof.detallesCoordinacion
              );

              return (
                <div
                  key={prof.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    esFocoRojo ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left Column: Info & Status */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>

                      <button
                        onClick={() => onSelectProfesor(prof)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline text-left"
                      >
                        {prof.nombre}
                      </button>

                      {esFocoRojo ? (
                        <span className="bg-rose-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          FOCO ROJO (≤ 7.0)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          REFUERZO PEDAGÓGICO
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-slate-500">Cédula: {prof.cedula}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Antigüedad: <strong className="font-mono text-slate-900">{antiguedad.texto}</strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-xs">{prof.especialidad}</span>
                    </div>

                    {/* Módulo de Capacitación Recomendado */}
                    <div className="pt-1 flex items-start gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          Módulo Sugerido:
                        </span>{' '}
                        <strong className="text-slate-800 font-medium">
                          [{diagnostico.codigoModulo}] {diagnostico.moduloRecomendado}
                        </strong>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <em>Área a reforzar:</em> {diagnostico.areaDebil}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Grades and Action Button */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right space-y-1">
                      <div className="flex items-baseline gap-1 justify-end font-mono">
                        <span
                          className={`text-xl font-black tabular-nums ${
                            esFocoRojo ? 'text-rose-700' : 'text-amber-800'
                          }`}
                        >
                          {promedio.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">/ 10</span>
                      </div>

                      <div className="text-[10px] text-slate-600 font-mono space-x-2">
                        <span>
                          Alumnos:{' '}
                          <strong
                            className={
                              prof.calificacionAlumnos < 9.0
                                ? prof.calificacionAlumnos <= 7.0
                                  ? 'text-rose-700'
                                  : 'text-amber-800'
                                : 'text-emerald-700'
                            }
                          >
                            {formatearCalificacion(prof.calificacionAlumnos)}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Coordinación:{' '}
                          <strong
                            className={
                              prof.calificacionCoordinacion < 9.0
                                ? prof.calificacionCoordinacion <= 7.0
                                  ? 'text-rose-700'
                                  : 'text-amber-800'
                                : 'text-emerald-700'
                            }
                          >
                            {formatearCalificacion(prof.calificacionCoordinacion)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProfesor(prof)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1.5"
                    >
                      <span>Ver Expediente</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 3: RANKINGS TOP EVALUADOS Y TOP ANTIGÜEDAD             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Docentes Evaluados */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Top 5 Docentes de Excelencia Académica (≥ 9.5)
            </h3>
            <span className="text-[11px] text-slate-500 ml-auto font-mono">
              (Alumnos + Coordinación)
            </span>
          </div>

          <div className="space-y-3">
            {topCalificados.map((prof, idx) => {
              const antiguedad = calcularAntiguedad(prof.fechaIngreso);
              const desempeno = obtenerCategoriaDesempeno(
                prof.calificacionAlumnos,
                prof.calificacionCoordinacion
              );

              return (
                <div
                  key={prof.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <button
                        onClick={() => onSelectProfesor(prof)}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline text-left block"
                      >
                        {prof.nombre}
                      </button>
                      <div className="text-[11px] text-slate-500">
                        {antiguedad.textoCorto} · {prof.especialidad.substring(0, 32)}...
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                      {desempeno.promedio.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Al: {formatearCalificacion(prof.calificacionAlumnos)} | Co:{' '}
                      {formatearCalificacion(prof.calificacionCoordinacion)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Antigüedad Docente */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Top 5 Decanos con Mayor Antigüedad
            </h3>
            <span className="text-[11px] text-slate-500 ml-auto font-mono">
              (Trayectoria Institucional)
            </span>
          </div>

          <div className="space-y-3">
            {topAntiguedad.map((prof, idx) => {
              const antiguedad = calcularAntiguedad(prof.fechaIngreso);
              const desempeno = obtenerCategoriaDesempeno(
                prof.calificacionAlumnos,
                prof.calificacionCoordinacion
              );

              return (
                <div
                  key={prof.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <button
                        onClick={() => onSelectProfesor(prof)}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline text-left block"
                      >
                        {prof.nombre}
                      </button>
                      <div className="text-[11px] text-slate-500">
                        Ingreso: {prof.fechaIngreso} · Céd. {prof.cedula}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                      {antiguedad.texto}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Calif Prom: {desempeno.promedio.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 4: DISTRIBUCIÓN Y BALANCE OPERATIVO POR MODALIDAD       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <BarChart2 className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">
            Balance Operativo por Modalidad Académica
          </h3>
          <span className="text-xs text-slate-500 ml-auto">
            Ciclo Actual
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
            <span className="text-xs font-bold text-blue-900 block mb-1">
              {MODALIDADES_CATALOGO.escolarizado.nombre}
            </span>
            <p className="text-[11px] text-blue-800 mb-3">
              {MODALIDADES_CATALOGO.escolarizado.descripcion}
            </p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-700">Grupos activos: <strong>{gruposEscolarizado}</strong></span>
              <span className="text-blue-900 font-bold">Materias: {asigEscolarizado}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900 block mb-1">
              {MODALIDADES_CATALOGO.ejecutivo.nombre}
            </span>
            <p className="text-[11px] text-emerald-800 mb-3">
              {MODALIDADES_CATALOGO.ejecutivo.descripcion}
            </p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-700">Grupos activos: <strong>{gruposEjecutivo}</strong></span>
              <span className="text-emerald-900 font-bold">Materias: {asigEjecutivo}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50/50 border border-purple-100">
            <span className="text-xs font-bold text-purple-900 block mb-1">
              {MODALIDADES_CATALOGO.a_distancia.nombre}
            </span>
            <p className="text-[11px] text-purple-800 mb-3">
              {MODALIDADES_CATALOGO.a_distancia.descripcion}
            </p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-700">Grupos activos: <strong>{gruposDistancia}</strong></span>
              <span className="text-purple-900 font-bold">Materias: {asigDistancia}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 5: DESGLOSE POR RUBROS: ALUMNOS VS COORDINACIÓN         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rubros de Evaluación Estudiantil */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Promedios por Rubro · Encuesta de Alumnos
            </h4>
          </div>

          <div className="space-y-2.5">
            {rubrosAlumnos.map((r) => (
              <div key={r.nombre}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{r.nombre}</span>
                  <span className="font-bold font-mono text-emerald-700 tabular-nums">
                    {r.promedio} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${Number(r.promedio) * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rubros de Auditoría de Coordinación */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Promedios por Rubro · Coordinación Académica
            </h4>
          </div>

          <div className="space-y-2.5">
            {rubrosCoord.map((r) => (
              <div key={r.nombre}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{r.nombre}</span>
                  <span className="font-bold font-mono text-blue-700 tabular-nums">
                    {r.promedio} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${Number(r.promedio) * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
