import React, { useState } from 'react';
import { 
  Clock, 
  ExternalLink, 
  Mail, 
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  Lock
} from 'lucide-react';
import { DatabaseState, Profesor, Usuario } from '../types/database';
import { DeleteItemTarget } from './DeleteConfirmModal';
import { 
  calcularAntiguedad, 
  formatearCalificacion, 
  MODALIDADES_CATALOGO, 
  obtenerCategoriaDesempeno 
} from '../utils/academicHelpers';

interface ProfessorsDirectoryProps {
  profesores: Profesor[];
  db: DatabaseState;
  currentUser: Usuario;
  onSelectProfesor: (profesor: Profesor) => void;
  onEvaluateProfesor: (profesor: Profesor) => void;
  onRequestDelete: (target: DeleteItemTarget) => void;
}

export const ProfessorsDirectory: React.FC<ProfessorsDirectoryProps> = ({
  profesores,
  db,
  currentUser,
  onSelectProfesor,
  onEvaluateProfesor,
  onRequestDelete,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const isAdmin = currentUser.rol === 'administrador';

  if (profesores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <h3 className="text-base font-semibold text-slate-800">
          No se encontraron profesores con los filtros seleccionados
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Modifica los parámetros de búsqueda de carrera, modalidad o antigüedad para ver el listado de docentes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Bar for View Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Mostrando <strong className="text-slate-900">{profesores.length}</strong> docentes registrados
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Vista de Tabla"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Vista de Tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* TABLE VIEW (High density, tabular nums) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Docente / Grado</th>
                  <th className="py-3.5 px-3">Especialidad</th>
                  <th className="py-3.5 px-3">Antigüedad Institucional</th>
                  <th className="py-3.5 px-3 text-center">Calif. Alumnos</th>
                  <th className="py-3.5 px-3 text-center">Calif. Coordinación</th>
                  <th className="py-3.5 px-3 text-center">Desempeño</th>
                  <th className="py-3.5 px-4">Asignaturas y Grupos</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profesores.map((prof) => {
                  const antiguedad = calcularAntiguedad(prof.fechaIngreso);
                  const desempeno = obtenerCategoriaDesempeno(
                    prof.calificacionAlumnos,
                    prof.calificacionCoordinacion
                  );

                  const asignacionesProf = db.asignaciones.filter(
                    (a) => a.profesorId === prof.id
                  );

                  return (
                    <tr key={prof.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Docente */}
                      <td className="py-3.5 px-4">
                        <div>
                          <button
                            onClick={() => onSelectProfesor(prof)}
                            className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors text-left"
                          >
                            {prof.nombre}
                          </button>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">Céd. {prof.cedula}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {prof.correo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Especialidad */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <span className="text-slate-700 line-clamp-2">
                          {prof.especialidad}
                        </span>
                      </td>

                      {/* Antigüedad */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold font-mono tabular-nums text-slate-900">
                            {antiguedad.texto}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Ingreso: {prof.fechaIngreso}
                        </span>
                      </td>

                      {/* Calificación Alumnos */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-baseline gap-0.5">
                          <span className="text-sm font-bold font-mono tabular-nums text-emerald-700">
                            {formatearCalificacion(prof.calificacionAlumnos)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">/10</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {prof.totalEvaluadosAlumnos} encuestas
                        </div>
                      </td>

                      {/* Calificación Coordinación */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-baseline gap-0.5">
                          <span className="text-sm font-bold font-mono tabular-nums text-blue-700">
                            {formatearCalificacion(prof.calificacionCoordinacion)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">/10</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Auditoría
                        </div>
                      </td>

                      {/* Desempeño */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${desempeno.colorClase}`}
                        >
                          {desempeno.nivel}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Prom: {desempeno.promedio.toFixed(2)}
                        </div>
                      </td>

                      {/* Asignaturas impartidas */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        {asignacionesProf.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">
                            Sin grupos asignados este ciclo
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {asignacionesProf.map((asig) => {
                              const mat = db.asignaturas.find((m) => m.id === asig.asignaturaId);
                              const grp = db.grupos.find((g) => g.id === asig.grupoId);
                              const mod = MODALIDADES_CATALOGO[asig.modalidad];
                              return (
                                <div
                                  key={asig.id}
                                  className="text-[11px] text-slate-700 flex items-center gap-1.5"
                                >
                                  <span className="font-mono font-semibold text-slate-900">
                                    {grp?.codigo || 'GRP'}:
                                  </span>
                                  <span className="truncate max-w-[140px]" title={mat?.nombre}>
                                    {mat?.nombre || 'Materia'}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1 py-0.2 rounded border ${mod.badgeColor} shrink-0`}
                                  >
                                    {mod.nombre.substring(0, 3)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectProfesor(prof)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
                            title="Ver Boleta de Desempeño y Rubros"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                            <span>Boleta</span>
                          </button>
                          <button
                            onClick={() => onEvaluateProfesor(prof)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                            title="Actualizar evaluación de coordinación"
                          >
                            <Edit3 className="w-3 h-3 text-blue-600" />
                            <span>Evaluar</span>
                          </button>
                          
                          {/* Botón Dar de Baja Maestro */}
                          <button
                            onClick={() =>
                              onRequestDelete({
                                tipo: 'maestro',
                                id: prof.id,
                                nombre: prof.nombre,
                                detallesExtra: `Cédula: ${prof.cedula} · Materias asignadas: ${asignacionesProf.length}`,
                              })
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
                              isAdmin
                                ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
                            }`}
                            title={
                              isAdmin
                                ? 'Dar de baja a este maestro'
                                : 'Solo el administrador URIEL puede dar de baja'
                            }
                          >
                            {isAdmin ? (
                              <Trash2 className="w-3 h-3 text-rose-600" />
                            ) : (
                              <Lock className="w-3 h-3 text-slate-400" />
                            )}
                            <span>Baja</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW (Card based) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profesores.map((prof) => {
            const antiguedad = calcularAntiguedad(prof.fechaIngreso);
            const desempeno = obtenerCategoriaDesempeno(
              prof.calificacionAlumnos,
              prof.calificacionCoordinacion
            );
            const asignacionesProf = db.asignaciones.filter(
              (a) => a.profesorId === prof.id
            );

            return (
              <div
                key={prof.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <button
                        onClick={() => onSelectProfesor(prof)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors text-left leading-tight"
                      >
                        {prof.nombre}
                      </button>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Cédula: {prof.cedula}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${desempeno.colorClase} shrink-0`}
                    >
                      {desempeno.nivel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {prof.especialidad}
                  </p>

                  {/* Indicators Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-3 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Antigüedad
                      </span>
                      <span className="font-bold font-mono text-slate-900 tabular-nums">
                        {antiguedad.textoCorto}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Alumnos
                      </span>
                      <span className="font-bold font-mono text-emerald-700 tabular-nums">
                        {formatearCalificacion(prof.calificacionAlumnos)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono"> /10</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Coordinación
                      </span>
                      <span className="font-bold font-mono text-blue-700 tabular-nums">
                        {formatearCalificacion(prof.calificacionCoordinacion)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono"> /10</span>
                    </div>
                  </div>

                  {/* Asignaturas impartidas */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Asignaturas en curso ({asignacionesProf.length})
                    </span>
                    {asignacionesProf.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        Sin materias asignadas este ciclo
                      </span>
                    ) : (
                      <div className="space-y-1">
                        {asignacionesProf.slice(0, 3).map((asig) => {
                          const mat = db.asignaturas.find((m) => m.id === asig.asignaturaId);
                          const grp = db.grupos.find((g) => g.id === asig.grupoId);
                          return (
                            <div
                              key={asig.id}
                              className="text-xs text-slate-700 flex items-center justify-between"
                            >
                              <span className="truncate max-w-[180px]" title={mat?.nombre}>
                                {mat?.nombre}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                {grp?.codigo}
                              </span>
                            </div>
                          );
                        })}
                        {asignacionesProf.length > 3 && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            +{asignacionesProf.length - 3} asignaturas adicionales
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectProfesor(prof)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Boleta</span>
                  </button>
                  <button
                    onClick={() => onEvaluateProfesor(prof)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Evaluar</span>
                  </button>
                  <button
                    onClick={() =>
                      onRequestDelete({
                        tipo: 'maestro',
                        id: prof.id,
                        nombre: prof.nombre,
                        detallesExtra: `Cédula: ${prof.cedula} · Materias: ${asignacionesProf.length}`,
                      })
                    }
                    className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-colors ${
                      isAdmin
                        ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                        : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
                    }`}
                    title={
                      isAdmin
                        ? 'Dar de baja maestro'
                        : 'Solo el administrador URIEL puede dar de baja'
                    }
                  >
                    {isAdmin ? (
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
