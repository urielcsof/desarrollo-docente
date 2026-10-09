import React, { useState } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { Licenciatura, ModalidadId } from '../types/database';

interface NewLicenciaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    lic: Omit<Licenciatura, 'id'>,
    options?: { autoGenerarGrupos?: boolean; abrirPlanCurricular?: boolean }
  ) => void;
}

export const NewLicenciaturaModal: React.FC<NewLicenciaturaModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('Tecnología e Informática');
  const [totalCuatrimestres, setTotalCuatrimestres] = useState(9);
  const [modalidades, setModalidades] = useState<ModalidadId[]>([
    'escolarizado',
    'ejecutivo',
    'a_distancia',
  ]);
  const [rvoe, setRvoe] = useState('SEP-DGAIR/2026-0899');
  const [directorCarrera, setDirectorCarrera] = useState('');
  const [autoGenerarGrupos, setAutoGenerarGrupos] = useState(true);
  const [abrirPlanCurricular, setAbrirPlanCurricular] = useState(true);

  if (!isOpen) return null;

  const toggleModalidad = (mod: ModalidadId) => {
    if (modalidades.includes(mod)) {
      if (modalidades.length === 1) return; // al menos 1 modalidad
      setModalidades(modalidades.filter((m) => m !== mod));
    } else {
      setModalidades([...modalidades, mod]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !nombre) return;

    onSave(
      {
        codigo: codigo.toUpperCase().trim(),
        nombre: nombre.trim(),
        area,
        totalCuatrimestres,
        modalidadesDisponibles: modalidades,
        rvoe: rvoe.trim(),
        directorCarrera: directorCarrera.trim() || 'Coordinación Académica General',
      },
      {
        autoGenerarGrupos,
        abrirPlanCurricular,
      }
    );

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
              Oferta Académica
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Dar de Alta Nueva Licenciatura / Carrera
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clave / Siglas
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="ej. IAI, LCD, LCP"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Carrera / Licenciatura
              </label>
              <input
                type="text"
                required
                placeholder="ej. Licenciatura en Inteligencia Artificial y Datos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Área del Conocimiento
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              >
                <option value="Tecnología e Informática">Tecnología e Informática</option>
                <option value="Negocios y Finanzas">Negocios y Finanzas</option>
                <option value="Ciencias Sociales y Jurídicas">Ciencias Sociales y Jurídicas</option>
                <option value="Ciencias de la Conducta y Salud">Ciencias de la Conducta y Salud</option>
                <option value="Ingeniería y Manufactura">Ingeniería y Manufactura</option>
                <option value="Diseño y Comunicación">Diseño y Comunicación</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duración del Plan
              </label>
              <select
                value={totalCuatrimestres}
                onChange={(e) => setTotalCuatrimestres(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              >
                <option value={9}>9 Cuatrimestres (3 años)</option>
                <option value={8}>8 Cuatrimestres (2.6 años)</option>
                <option value={10}>10 Cuatrimestres (3.3 años)</option>
                <option value={12}>12 Cuatrimestres (4 años)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Acuerdo RVOE (SEP)
              </label>
              <input
                type="text"
                placeholder="ej. SEP-DGAIR/2026-0899"
                value={rvoe}
                onChange={(e) => setRvoe(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Director o Coordinador de Carrera
              </label>
              <input
                type="text"
                placeholder="ej. Dr. Fernando Morales"
                value={directorCarrera}
                onChange={(e) => setDirectorCarrera(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Modalidades Disponibles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Modalidades en que se Impartirá la Carrera
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggleModalidad('escolarizado')}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                  modalidades.includes('escolarizado')
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>Escolarizado</span>
                {modalidades.includes('escolarizado') && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => toggleModalidad('ejecutivo')}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                  modalidades.includes('ejecutivo')
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>Ejecutivo</span>
                {modalidades.includes('ejecutivo') && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => toggleModalidad('a_distancia')}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                  modalidades.includes('a_distancia')
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>A Distancia</span>
                {modalidades.includes('a_distancia') && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Selecciona las modalidades habilitadas para inscripciones y asignación docente.
            </span>
          </div>

          {/* Opciones de Automatización Curricular */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              Asignaturas y Configuración Curricular
            </span>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerarGrupos}
                onChange={(e) => setAutoGenerarGrupos(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                <strong className="text-slate-900">Generar grupos escolares iniciales</strong> para cada cuatrimestre (permite que la carrera aparezca de inmediato en la Malla Curricular).
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={abrirPlanCurricular}
                onChange={(e) => setAbrirPlanCurricular(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                <strong className="text-slate-900">Abrir de inmediato el Plan de Estudios</strong> para agregar las asignaturas por cuatrimestre y asignar profesores titulares.
              </span>
            </label>
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
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Licenciatura</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
