import React, { useState } from 'react';
import { X, Check, Star } from 'lucide-react';
import { Profesor } from '../types/database';

interface EvaluateProfessorModalProps {
  profesor: Profesor | null;
  onClose: () => void;
  onSave: (profesorId: string, updates: Partial<Profesor>) => void;
}

export const EvaluateProfessorModal: React.FC<EvaluateProfessorModalProps> = ({
  profesor,
  onClose,
  onSave,
}) => {
  if (!profesor) return null;

  // State for Rubrics
  const [alumnosDominio, setAlumnosDominio] = useState(profesor.detallesAlumnos.dominioTema);
  const [alumnosClaridad, setAlumnosClaridad] = useState(profesor.detallesAlumnos.claridadExposicion);
  const [alumnosPuntualidad, setAlumnosPuntualidad] = useState(profesor.detallesAlumnos.puntualidadAsistencia);
  const [alumnosRetro, setAlumnosRetro] = useState(profesor.detallesAlumnos.retroalimentacion);
  const [alumnosEmpatia, setAlumnosEmpatia] = useState(profesor.detallesAlumnos.empatiaYRespeto);

  const [coordPlaneacion, setCoordPlaneacion] = useState(profesor.detallesCoordinacion.entregaPlaneaciones);
  const [coordClaustros, setCoordClaustros] = useState(profesor.detallesCoordinacion.asistenciaClaustros);
  const [coordAvance, setCoordAvance] = useState(profesor.detallesCoordinacion.avanceProgramatico);
  const [coordActas, setCoordActas] = useState(profesor.detallesCoordinacion.subidaCalificacionesTiempo);
  const [coordInnovacion, setCoordInnovacion] = useState(profesor.detallesCoordinacion.innovacionDidactica);
  const [observaciones, setObservaciones] = useState(profesor.observacionesCoordinacion || '');

  // Computed averages
  const califAlumnosCalc = Number(
    ((alumnosDominio + alumnosClaridad + alumnosPuntualidad + alumnosRetro + alumnosEmpatia) / 5).toFixed(1)
  );

  const califCoordCalc = Number(
    ((coordPlaneacion + coordClaustros + coordAvance + coordActas + coordInnovacion) / 5).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave(profesor.id, {
      calificacionAlumnos: califAlumnosCalc,
      detallesAlumnos: {
        dominioTema: alumnosDominio,
        claridadExposicion: alumnosClaridad,
        puntualidadAsistencia: alumnosPuntualidad,
        retroalimentacion: alumnosRetro,
        empatiaYRespeto: alumnosEmpatia,
      },
      calificacionCoordinacion: califCoordCalc,
      detallesCoordinacion: {
        entregaPlaneaciones: coordPlaneacion,
        asistenciaClaustros: coordClaustros,
        avanceProgramatico: coordAvance,
        subidaCalificacionesTiempo: coordActas,
        innovacionDidactica: coordInnovacion,
      },
      observacionesCoordinacion: observaciones,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Evaluación Docente
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Actualizar Calificaciones de {profesor.nombre}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Promedios en Vivo */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                Promedio Alumnos Calculado
              </span>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {califAlumnosCalc.toFixed(1)} / 10
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">
                Promedio Coordinación Calculado
              </span>
              <div className="text-xl font-bold font-mono text-blue-700">
                {califCoordCalc.toFixed(1)} / 10
              </div>
            </div>
          </div>

          {/* Rubros Alumnos */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-emerald-600" />
              Rubros de Evaluación Estudiantil (0.0 a 10.0)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Dominio del Tema</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={alumnosDominio}
                  onChange={(e) => setAlumnosDominio(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Claridad de Exposición</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={alumnosClaridad}
                  onChange={(e) => setAlumnosClaridad(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Puntualidad y Asistencia</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={alumnosPuntualidad}
                  onChange={(e) => setAlumnosPuntualidad(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Retroalimentación de Tareas</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={alumnosRetro}
                  onChange={(e) => setAlumnosRetro(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-600 block mb-1">Empatía y Respeto</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={alumnosEmpatia}
                  onChange={(e) => setAlumnosEmpatia(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Rubros Coordinación */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-blue-600" />
              Rubros de Coordinación Académica (0.0 a 10.0)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Entrega de Planeaciones</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={coordPlaneacion}
                  onChange={(e) => setCoordPlaneacion(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Asistencia a Claustros</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={coordClaustros}
                  onChange={(e) => setCoordClaustros(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Avance Programático</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={coordAvance}
                  onChange={(e) => setCoordAvance(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Subida Oportuna de Actas</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={coordActas}
                  onChange={(e) => setCoordActas(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-600 block mb-1">Innovación Didáctica</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={coordInnovacion}
                  onChange={(e) => setCoordInnovacion(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones o Dictamen de Coordinación
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Anotaciones cualitativas sobre el desempeño del profesor en el periodo..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
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
              <span>Guardar Evaluación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
