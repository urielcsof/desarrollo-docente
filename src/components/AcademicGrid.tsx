import React from 'react';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  Calendar, 
  ExternalLink, 
  MapPin, 
  PlusCircle, 
  GraduationCap,
  Trash2,
  Lock,
  Edit3,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { 
  AsignacionDocente, 
  Asignatura, 
  DatabaseState, 
  Grupo, 
  Profesor,
  Usuario,
  Licenciatura 
} from '../types/database';
import { DeleteItemTarget } from './DeleteConfirmModal';
import { 
  calcularAntiguedad, 
  formatearCalificacion, 
  MODALIDADES_CATALOGO, 
  obtenerCategoriaDesempeno 
} from '../utils/academicHelpers';

interface AcademicGridProps {
  db: DatabaseState;
  gruposFiltrados: Grupo[];
  currentUser: Usuario;
  selectedLicenciaturaId?: string;
  onSelectProfesor: (profesor: Profesor) => void;
  onOpenAssignModal: (params: {
    asignatura: Asignatura;
    grupo: Grupo;
    asignacionActual?: AsignacionDocente;
  }) => void;
  onRequestDelete: (target: DeleteItemTarget) => void;
  onOpenEditLicenciatura?: (lic: Licenciatura) => void;
  onOpenCurriculumPlan?: (lic: Licenciatura) => void;
  onGenerateGroups?: (licenciaturaId: string) => void;
}

export const AcademicGrid: React.FC<AcademicGridProps> = ({
  db,
  gruposFiltrados,
  currentUser,
  selectedLicenciaturaId,
  onSelectProfesor,
  onOpenAssignModal,
  onRequestDelete,
  onOpenEditLicenciatura,
  onOpenCurriculumPlan,
  onGenerateGroups,
}) => {
  const isAdmin = currentUser.rol === 'administrador';

  if (gruposFiltrados.length === 0) {
    const selectedLic = selectedLicenciaturaId && selectedLicenciaturaId !== 'todas'
      ? db.licenciaturas.find((l) => l.id === selectedLicenciaturaId)
      : null;

    if (selectedLic) {
      const materiasLic = db.asignaturas.filter((a) => a.licenciaturaId === selectedLic.id);
      const asignacionesLic = db.asignaciones.filter((as) => as.licenciaturaId === selectedLic.id);

      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {selectedLic.codigo}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Plan Curricular de Estudios
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedLic.nombre}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Esta licenciatura cuenta con {materiasLic.length} materias registradas y {selectedLic.totalCuatrimestres} cuatrimestres.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenCurriculumPlan && (
                <button
                  onClick={() => onOpenCurriculumPlan(selectedLic)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Gestionar Asignaturas y Profesores por Cuatrimestre</span>
                </button>
              )}

              {onGenerateGroups && (
                <button
                  onClick={() => onGenerateGroups(selectedLic.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Generar Grupos Escolares</span>
                </button>
              )}
            </div>
          </div>

          {/* Cuatrimestres preview */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Asignaturas Registradas por Cuatrimestre ({materiasLic.length})
            </h4>

            {materiasLic.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-3">
                <p className="text-xs text-slate-500">
                  Aún no has agregado asignaturas para esta licenciatura.
                </p>
                {onOpenCurriculumPlan && (
                  <button
                    onClick={() => onOpenCurriculumPlan(selectedLic)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Agregar Materias por Cuatrimestre y Asignar Profesores</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {materiasLic.map((m) => {
                  const asigDoc = asignacionesLic.find((a) => a.asignaturaId === m.id);
                  const prof = asigDoc ? db.profesores.find((p) => p.id === asigDoc.profesorId) : null;

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {m.clave}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700">
                          {m.cuatrimestre}º Cuatrimestre
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {m.nombre}
                      </h5>
                      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        {prof ? (
                          <span className="font-medium text-emerald-800">
                            👨‍🏫 {prof.nombre}
                          </span>
                        ) : (
                          <span className="font-medium text-amber-700">
                            ⚠️ Vacante sin profesor
                          </span>
                        )}
                        {onOpenCurriculumPlan && (
                          <button
                            onClick={() => onOpenCurriculumPlan(selectedLic)}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Gestionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">
          No se encontraron grupos con los filtros actuales
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Intenta seleccionar otra licenciatura, modalidad o cuatrimestre para ver los grupos y profesores asignados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gruposFiltrados.map((grupo) => {
        const lic = db.licenciaturas.find((l) => l.id === grupo.licenciaturaId);
        const modInfo = MODALIDADES_CATALOGO[grupo.modalidad];

        // Asignaturas correspondientes a la licenciatura y cuatrimestre del grupo
        const materiasGrupo = db.asignaturas.filter(
          (a) =>
            a.licenciaturaId === grupo.licenciaturaId &&
            a.cuatrimestre === grupo.cuatrimestre
        );

        return (
          <div
            key={grupo.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
          >
            {/* Header del Grupo */}
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                  <span className="font-semibold text-white tracking-wide">
                    {lic?.nombre || 'Licenciatura'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{grupo.cuatrimestre}º Cuatrimestre</span>
                  <span aria-hidden="true">·</span>
                  <span>{modInfo.nombre}</span>

                  {lic && (
                    <div className="inline-flex items-center gap-1 ml-2">
                      {onOpenCurriculumPlan && (
                        <button
                          onClick={() => onOpenCurriculumPlan(lic)}
                          className="p-1 px-1.5 text-blue-200 hover:text-white bg-slate-800 hover:bg-blue-600 rounded transition-colors inline-flex items-center gap-1 text-[10px]"
                          title={`Gestionar asignaturas por cuatrimestre y profesores de ${lic.nombre}`}
                        >
                          <BookOpen className="w-3 h-3 text-blue-400" />
                          <span className="hidden sm:inline">Plan Materias</span>
                        </button>
                      )}

                      {onOpenEditLicenciatura && (
                        <button
                          onClick={() => onOpenEditLicenciatura(lic)}
                          className="p-1 px-1.5 text-blue-300 hover:text-white bg-slate-800 hover:bg-blue-600 rounded transition-colors inline-flex items-center gap-1 text-[10px]"
                          title={`Modificar datos curriculares de ${lic.nombre}`}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span className="hidden sm:inline">Modificar</span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          onRequestDelete({
                            tipo: 'licenciatura',
                            id: lic.id,
                            nombre: lic.nombre,
                            detallesExtra: `Clave: ${lic.codigo} · RVOE: ${lic.rvoe}`,
                          })
                        }
                        className="p-1 px-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1 text-[10px]"
                        title={
                          isAdmin
                            ? `Dar de baja licenciatura ${lic.nombre}`
                            : 'Solo el administrador URIEL puede dar de baja licenciaturas'
                        }
                      >
                        {isAdmin ? <Trash2 className="w-3 h-3" /> : <Lock className="w-3 h-3 text-slate-500" />}
                        <span className="hidden sm:inline">Baja</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    Grupo {grupo.codigo}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Turno: {grupo.turno}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{grupo.aula}</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div>
                  <span className="text-slate-400">Cupo:</span>{' '}
                  <span className="font-mono text-white">{grupo.cupoAlumnos} alumnos</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div>
                  <span className="text-slate-400">Ciclo:</span>{' '}
                  <span className="font-mono text-white">{grupo.cicloEscolar}</span>
                </div>
              </div>
            </div>

            {/* Malla de Asignaturas y Profesores correspondientes */}
            <div className="divide-y divide-slate-100">
              {materiasGrupo.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <p>No hay materias registradas para este cuatrimestre ({grupo.cuatrimestre}º Cuat.) en {lic?.nombre}.</p>
                  {onOpenCurriculumPlan && lic && (
                    <button
                      onClick={() => onOpenCurriculumPlan(lic)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-2xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Agregar Asignatura al {grupo.cuatrimestre}º Cuatrimestre</span>
                    </button>
                  )}
                </div>
              ) : (
                materiasGrupo.map((materia) => {
                  // Buscar asignación de esta materia para este grupo
                  const asignacion = db.asignaciones.find(
                    (a) => a.asignaturaId === materia.id && a.grupoId === grupo.id
                  );
                  const profesor = asignacion
                    ? db.profesores.find((p) => p.id === asignacion.profesorId)
                    : undefined;

                  const antiguedad = profesor ? calcularAntiguedad(profesor.fechaIngreso) : null;
                  const desempeno = profesor
                    ? obtenerCategoriaDesempeno(
                        profesor.calificacionAlumnos,
                        profesor.calificacionCoordinacion
                      )
                    : null;

                  return (
                    <div
                      key={materia.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Columna Asignatura (4 cols) */}
                        <div className="lg:col-span-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {materia.clave}
                              </span>
                              <span className="text-xs text-slate-500">
                                {materia.areaCurricular}
                              </span>
                            </div>

                            {/* Botón Dar de Baja Asignatura */}
                            <button
                              onClick={() =>
                                onRequestDelete({
                                  tipo: 'asignatura',
                                  id: materia.id,
                                  nombre: `${materia.clave} · ${materia.nombre}`,
                                  detallesExtra: `${lic?.nombre} · ${materia.cuatrimestre}º Cuatrimestre`,
                                })
                              }
                              className={`p-1 text-xs rounded transition-colors inline-flex items-center gap-1 ${
                                isAdmin
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-300 hover:text-slate-500'
                              }`}
                              title={
                                isAdmin
                                  ? `Dar de baja asignatura ${materia.nombre}`
                                  : 'Solo el administrador URIEL puede dar de baja asignaturas'
                              }
                            >
                              {isAdmin ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">Baja</span>
                            </button>
                          </div>

                          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                            {materia.nombre}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                              {materia.horasSemanales} hrs/sem
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{materia.creditos} créditos</span>
                            {asignacion?.horario && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-slate-700 flex items-center gap-1 font-medium">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {asignacion.horario}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Columna Profesor Asignado & Antigüedad & Calificaciones (6 cols) */}
                        <div className="lg:col-span-6">
                          {profesor && antiguedad && desempeno ? (
                            <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200">
                              {/* Nombre y grado */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <button
                                      onClick={() => onSelectProfesor(profesor)}
                                      className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors text-left"
                                    >
                                      {profesor.nombre}
                                    </button>
                                  </div>
                                  <div className="text-[11px] text-slate-500 ml-6 truncate max-w-sm">
                                    {profesor.especialidad}
                                  </div>
                                </div>

                                {/* Nivel Desempeño */}
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${desempeno.colorClase} border whitespace-nowrap`}
                                >
                                  {desempeno.nivel}
                                </span>
                              </div>

                              {/* Indicadores: Antigüedad, Calif Alumnos, Calif Coordinación */}
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                                {/* Antigüedad */}
                                <div>
                                  <span className="block text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    Antigüedad
                                  </span>
                                  <span
                                    className="font-bold text-slate-900 font-mono tabular-nums text-[11px]"
                                    title={`Fecha de ingreso: ${profesor.fechaIngreso}`}
                                  >
                                    {antiguedad.texto}
                                  </span>
                                </div>

                                {/* Calificación Alumnos */}
                                <div>
                                  <span className="block text-[10px] text-slate-500 font-medium">
                                    Calif. Alumnos
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-bold text-emerald-700 font-mono tabular-nums text-sm">
                                      {formatearCalificacion(profesor.calificacionAlumnos)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">/ 10</span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 block -mt-0.5">
                                    ({profesor.totalEvaluadosAlumnos} evals)
                                  </span>
                                </div>

                                {/* Calificación Coordinación */}
                                <div>
                                  <span className="block text-[10px] text-slate-500 font-medium">
                                    Calif. Coordinación
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-bold text-blue-700 font-mono tabular-nums text-sm">
                                      {formatearCalificacion(profesor.calificacionCoordinacion)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">/ 10</span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 block -mt-0.5">
                                    Auditoría institucional
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-amber-800">
                                <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                                <div>
                                  <span className="font-semibold block">
                                    Sin profesor asignado
                                  </span>
                                  <span className="text-[11px] text-amber-700">
                                    Esta materia requiere titular en el grupo {grupo.codigo}.
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  onOpenAssignModal({ asignatura: materia, grupo })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Asignar Titular</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Columna Acciones (2 cols) */}
                        <div className="lg:col-span-2 flex lg:flex-col items-center justify-end gap-2">
                          {profesor && (
                            <>
                              <button
                                onClick={() => onSelectProfesor(profesor)}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                <span>Ver Boleta</span>
                              </button>
                              <button
                                onClick={() =>
                                  onOpenAssignModal({
                                    asignatura: materia,
                                    grupo,
                                    asignacionActual: asignacion,
                                  })
                                }
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
                              >
                                <span>Reasignar</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
