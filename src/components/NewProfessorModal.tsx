import React, { useState } from 'react';
import { X, UserPlus, Clock } from 'lucide-react';
import { Profesor } from '../types/database';
import { calcularAntiguedad } from '../utils/academicHelpers';

interface NewProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profesor: Omit<Profesor, 'id'>) => void;
}

export const NewProfessorModal: React.FC<NewProfessorModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [gradoAcademico, setGradoAcademico] = useState<Profesor['gradoAcademico']>('Mtro.');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('2022-01-15');
  const [especialidad, setEspecialidad] = useState('');
  const [calificacionAlumnos, setCalificacionAlumnos] = useState(9.2);
  const [calificacionCoordinacion, setCalificacionCoordinacion] = useState(9.3);

  if (!isOpen) return null;

  const antiguedadCalculada = calcularAntiguedad(fechaIngreso);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !correo || !cedula) return;

    onSave({
      nombre: `${gradoAcademico} ${nombre.replace(/^(Lic\.|Ing\.|Mtro\.|Mtra\.|Dr\.|Dra\.)\s*/i, '')}`,
      gradoAcademico,
      correo,
      telefono: telefono || '+52 55 0000 0000',
      cedula,
      fechaIngreso,
      calificacionAlumnos,
      totalEvaluadosAlumnos: 25,
      detallesAlumnos: {
        dominioTema: Number(calificacionAlumnos.toFixed(1)),
        claridadExposicion: Number(calificacionAlumnos.toFixed(1)),
        puntualidadAsistencia: Number(calificacionAlumnos.toFixed(1)),
        retroalimentacion: Number(calificacionAlumnos.toFixed(1)),
        empatiaYRespeto: Number(calificacionAlumnos.toFixed(1)),
      },
      calificacionCoordinacion,
      detallesCoordinacion: {
        entregaPlaneaciones: Number(calificacionCoordinacion.toFixed(1)),
        asistenciaClaustros: Number(calificacionCoordinacion.toFixed(1)),
        avanceProgramatico: Number(calificacionCoordinacion.toFixed(1)),
        subidaCalificacionesTiempo: Number(calificacionCoordinacion.toFixed(1)),
        innovacionDidactica: Number(calificacionCoordinacion.toFixed(1)),
      },
      especialidad: especialidad || 'Docencia Universitaria e Investigación',
      estado: 'activo',
      observacionesCoordinacion: 'Docente registrado recientemente en el sistema.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Gestión de Plantilla
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Registrar Nuevo Docente
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grado
              </label>
              <select
                value={gradoAcademico}
                onChange={(e) =>
                  setGradoAcademico(e.target.value as Profesor['gradoAcademico'])
                }
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-slate-900"
              >
                <option value="Lic.">Lic.</option>
                <option value="Ing.">Ing.</option>
                <option value="Mtro.">Mtro.</option>
                <option value="Mtra.">Mtra.</option>
                <option value="Dr.">Dr.</option>
                <option value="Dra.">Dra.</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellidos
              </label>
              <input
                type="text"
                required
                placeholder="ej. Eduardo Santana Domínguez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula Profesional
              </label>
              <input
                type="text"
                required
                placeholder="ej. 9821450-M"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Institucional
              </label>
              <input
                type="email"
                required
                placeholder="ej. e.santana@universidad.edu.mx"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Ingreso a la Universidad
              </label>
              <input
                type="date"
                required
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-blue-700 mt-1 font-medium">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>Antigüedad calculada: <strong>{antiguedadCalculada.texto}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="+52 55 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Especialidad y Perfil Académico
            </label>
            <textarea
              rows={2}
              placeholder="ej. Sistemas Distribuidos, Calidad de Software y Computación en la Nube"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Calificación Alumnos (0 a 10)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={calificacionAlumnos}
                onChange={(e) => setCalificacionAlumnos(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Calificación Coordinación (0 a 10)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={calificacionCoordinacion}
                onChange={(e) => setCalificacionCoordinacion(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

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
              <UserPlus className="w-4 h-4" />
              <span>Registrar Profesor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
