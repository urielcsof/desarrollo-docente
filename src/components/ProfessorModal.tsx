import React from 'react';
import { 
  X, 
  Printer, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { DatabaseState, Profesor, Usuario } from '../types/database';
import { DeleteItemTarget } from './DeleteConfirmModal';
import { 
  calcularAntiguedad, 
  formatearCalificacion, 
  MODALIDADES_CATALOGO, 
  obtenerCategoriaDesempeno 
} from '../utils/academicHelpers';

interface ProfessorModalProps {
  profesor: Profesor | null;
  onClose: () => void;
  db: DatabaseState;
  currentUser: Usuario;
  onEditEvaluation: (profesor: Profesor) => void;
  onRequestDelete: (target: DeleteItemTarget) => void;
}

export const ProfessorModal: React.FC<ProfessorModalProps> = ({
  profesor,
  onClose,
  db,
  currentUser,
  onEditEvaluation,
  onRequestDelete,
}) => {
  if (!profesor) return null;

  const isAdmin = currentUser.rol === 'administrador';
  const antiguedad = calcularAntiguedad(profesor.fechaIngreso);
  const desempeno = obtenerCategoriaDesempeno(
    profesor.calificacionAlumnos,
    profesor.calificacionCoordinacion
  );

  const asignaciones = db.asignaciones.filter((a) => a.profesorId === profesor.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Expediente Institucional Docente
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{profesor.nombre}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${desempeno.colorClase}`}>
                {desempeno.nivel}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Imprimir Boleta de Desempeño"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* General Information Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Cédula Profesional
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {profesor.cedula}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Grado: {profesor.gradoAcademico}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Contacto Institucional
              </span>
              <div className="text-xs text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{profesor.correo}</span>
              </div>
              <div className="text-xs text-slate-800 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{profesor.telefono}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Antigüedad en la Universidad
              </span>
              <div className="text-xs font-bold font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{antiguedad.texto}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Fecha de Ingreso: {profesor.fechaIngreso}
              </span>
            </div>
          </div>

          {/* Especialidad & Perfil */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Línea de Especialidad y Enfoque Profesional
            </h4>
            <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {profesor.especialidad}
            </p>
          </div>

          {/* Side by side Evaluations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Evaluación de Alumnos */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Evaluación Estudiantil
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Basado en {profesor.totalEvaluadosAlumnos} encuestas anónimas
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                    {formatearCalificacion(profesor.calificacionAlumnos)}
                    <span className="text-xs text-slate-400 font-mono"> / 10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Dominio de la Materia</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesAlumnos.dominioTema}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesAlumnos.dominioTema * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Claridad y Didáctica</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesAlumnos.claridadExposicion}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesAlumnos.claridadExposicion * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Puntualidad y Asistencia</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesAlumnos.puntualidadAsistencia}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesAlumnos.puntualidadAsistencia * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Retroalimentación de Trabajos</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesAlumnos.retroalimentacion}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesAlumnos.retroalimentacion * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Empatía y Respeto a Alumnos</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesAlumnos.empatiaYRespeto}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesAlumnos.empatiaYRespeto * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Evaluación de Coordinación */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Auditoría de Coordinación
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Claustros y seguimiento institucional
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-blue-700 tabular-nums">
                    {formatearCalificacion(profesor.calificacionCoordinacion)}
                    <span className="text-xs text-slate-400 font-mono"> / 10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Entrega Oportuna de Planeaciones</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesCoordinacion.entregaPlaneaciones}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesCoordinacion.entregaPlaneaciones * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Asistencia a Claustros y Juntas</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesCoordinacion.asistenciaClaustros}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesCoordinacion.asistenciaClaustros * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Avance Programático Oficial</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesCoordinacion.avanceProgramatico}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesCoordinacion.avanceProgramatico * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Subida Oportuna de Calificaciones</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesCoordinacion.subidaCalificacionesTiempo}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesCoordinacion.subidaCalificacionesTiempo * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Innovación y Recursos Didácticos</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profesor.detallesCoordinacion.innovacionDidactica}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${profesor.detallesCoordinacion.innovacionDidactica * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones de Coordinación */}
          {profesor.observacionesCoordinacion && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <span className="font-bold block mb-1">Dictamen de Coordinación Académica:</span>
              <p>{profesor.observacionesCoordinacion}</p>
            </div>
          )}

          {/* Asignaturas y Grupos Asignados */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Carga Académica Actual ({asignaciones.length} grupos asignados)
            </h4>

            {asignaciones.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                El docente no tiene materias asignadas para el periodo vigente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {asignaciones.map((asig) => {
                  const mat = db.asignaturas.find((m) => m.id === asig.asignaturaId);
                  const grp = db.grupos.find((g) => g.id === asig.grupoId);
                  const mod = MODALIDADES_CATALOGO[asig.modalidad];
                  const lic = db.licenciaturas.find((l) => l.id === asig.licenciaturaId);

                  return (
                    <div
                      key={asig.id}
                      className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            Grupo {grp?.codigo}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded border ${mod.badgeColor}`}
                          >
                            {mod.nombre}
                          </span>
                          <span className="text-slate-500">
                            {lic?.codigo} · {asig.cuatrimestre}º Cuatrimestre
                          </span>
                        </div>
                        <span className="font-semibold text-slate-800 block mt-0.5">
                          {mat?.clave} · {mat?.nombre}
                        </span>
                      </div>

                      <div className="text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{asig.horario}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ID: <span className="font-mono">{profesor.id}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onRequestDelete({
                  tipo: 'maestro',
                  id: profesor.id,
                  nombre: profesor.nombre,
                  detallesExtra: `Cédula: ${profesor.cedula} · Fecha ingreso: ${profesor.fechaIngreso}`,
                });
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                isAdmin
                  ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                  : 'text-slate-500 bg-slate-100 border-slate-200 hover:text-slate-700'
              }`}
              title={
                isAdmin
                  ? 'Dar de baja a este docente'
                  : 'Solo el administrador URIEL puede dar de baja'
              }
            >
              <span>Dar de Baja Docente</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEditEvaluation(profesor);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Actualizar Calificaciones
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
