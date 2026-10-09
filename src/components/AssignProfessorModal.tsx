import React, { useState } from 'react';
import { X, Check, Clock, Star } from 'lucide-react';
import { 
  AsignacionDocente, 
  Asignatura, 
  DatabaseState, 
  Grupo, 
  Profesor 
} from '../types/database';
import { 
  calcularAntiguedad, 
  formatearCalificacion, 
  MODALIDADES_CATALOGO 
} from '../utils/academicHelpers';

interface AssignProfessorModalProps {
  params: {
    asignatura: Asignatura;
    grupo: Grupo;
    asignacionActual?: AsignacionDocente;
  } | null;
  onClose: () => void;
  db: DatabaseState;
  onSaveAssignment: (asignacion: Omit<AsignacionDocente, 'id'>) => void;
}

export const AssignProfessorModal: React.FC<AssignProfessorModalProps> = ({
  params,
  onClose,
  db,
  onSaveAssignment,
}) => {
  if (!params) return null;

  const { asignatura, grupo, asignacionActual } = params;
  const modInfo = MODALIDADES_CATALOGO[grupo.modalidad];

  const [selectedProfesorId, setSelectedProfesorId] = useState<string>(
    asignacionActual?.profesorId || (db.profesores[0]?.id ?? '')
  );

  const defaultHorario =
    asignacionActual?.horario ||
    (grupo.modalidad === 'escolarizado'
      ? 'Lun y Mié 08:00 - 10:00 hrs'
      : grupo.modalidad === 'ejecutivo'
      ? 'Sábados 08:00 - 11:30 hrs'
      : 'Martes 19:00 - 21:00 hrs (Virtual)');

  const [horario, setHorario] = useState<string>(defaultHorario);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredProfesores = db.profesores.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfesorId) return;

    onSaveAssignment({
      profesorId: selectedProfesorId,
      asignaturaId: asignatura.id,
      grupoId: grupo.id,
      licenciaturaId: grupo.licenciaturaId,
      modalidad: grupo.modalidad,
      cuatrimestre: grupo.cuatrimestre,
      horario,
      estado: 'confirmada',
    });
    onClose();
  };

  const selectedProf = db.profesores.find((p) => p.id === selectedProfesorId);
  const selectedAntiguedad = selectedProf
    ? calcularAntiguedad(selectedProf.fechaIngreso)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Asignación Docente
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Asignar Profesor a Asignatura
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Subject & Group Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-500">
                {asignatura.clave}
              </span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${modInfo.badgeColor}`}>
                {modInfo.nombre}
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {asignatura.nombre}
            </div>
            <div className="text-slate-500 flex items-center gap-2">
              <span>Grupo: <strong className="text-slate-800 font-mono">{grupo.codigo}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{grupo.cuatrimestre}º Cuatrimestre</span>
              <span aria-hidden="true">·</span>
              <span>{grupo.aula}</span>
            </div>
          </div>

          {/* Teacher Selection with search and candidate cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seleccionar Profesor Titular
            </label>
            <input
              type="text"
              placeholder="Buscar profesor por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />

            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2">
              {filteredProfesores.map((prof) => {
                const isSelected = prof.id === selectedProfesorId;
                const ant = calcularAntiguedad(prof.fechaIngreso);
                return (
                  <div
                    key={prof.id}
                    onClick={() => setSelectedProfesorId(prof.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{prof.nombre}</div>
                      <div
                        className={`text-[11px] truncate max-w-xs ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {prof.especialidad}
                      </div>
                    </div>

                    <div className="text-right text-[11px] shrink-0 ml-2">
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 opacity-70" />
                        <span className="font-mono">{ant.textoCorto}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end font-mono">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>Al: {formatearCalificacion(prof.calificacionAlumnos)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Días y Horario de Impartición
            </label>
            <input
              type="text"
              required
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Ejemplo: "Lun y Mié 08:00 - 10:00 hrs" o "Sábados 08:00 - 12:00 hrs"
            </span>
          </div>

          {/* Summary Preview */}
          {selectedProf && selectedAntiguedad && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">Profesor Confirmado:</span>
                <span>{selectedProf.nombre}</span>
              </div>
              <div className="text-right font-mono text-[11px]">
                <div>Antigüedad: {selectedAntiguedad.texto}</div>
                <div>Calif Alumnos: {selectedProf.calificacionAlumnos.toFixed(1)} / 10</div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Asignación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
