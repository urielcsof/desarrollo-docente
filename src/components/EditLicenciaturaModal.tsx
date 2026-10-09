import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, Layers, BookOpen } from 'lucide-react';
import { Licenciatura, ModalidadId } from '../types/database';
import { MODALIDADES_CATALOGO } from '../utils/academicHelpers';

interface EditLicenciaturaModalProps {
  licenciatura: Licenciatura | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Licenciatura>) => void;
  onOpenCurriculumPlan?: (lic: Licenciatura) => void;
}

export const EditLicenciaturaModal: React.FC<EditLicenciaturaModalProps> = ({
  licenciatura,
  isOpen,
  onClose,
  onSave,
  onOpenCurriculumPlan,
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
  const [rvoe, setRvoe] = useState('');
  const [directorCarrera, setDirectorCarrera] = useState('');

  // Populate state whenever licenciatura changes
  useEffect(() => {
    if (licenciatura) {
      setCodigo(licenciatura.codigo || '');
      setNombre(licenciatura.nombre || '');
      setArea(licenciatura.area || 'Tecnología e Informática');
      setTotalCuatrimestres(licenciatura.totalCuatrimestres || 9);
      setModalidades(licenciatura.modalidadesDisponibles || ['escolarizado']);
      setRvoe(licenciatura.rvoe || '');
      setDirectorCarrera(licenciatura.directorCarrera || '');
    }
  }, [licenciatura]);

  if (!isOpen || !licenciatura) return null;

  const toggleModalidad = (mod: ModalidadId) => {
    if (modalidades.includes(mod)) {
      if (modalidades.length === 1) return; // Mantener al menos una modalidad activa
      setModalidades(modalidades.filter((m) => m !== mod));
    } else {
      setModalidades([...modalidades, mod]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !nombre) return;

    onSave(licenciatura.id, {
      codigo: codigo.toUpperCase().trim(),
      nombre: nombre.trim(),
      area,
      totalCuatrimestres: Number(totalCuatrimestres),
      modalidadesDisponibles: modalidades,
      rvoe: rvoe.trim(),
      directorCarrera: directorCarrera.trim() || 'Coordinación Académica General',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Actualización Curricular
              </span>
              <h3 className="text-base font-bold text-white">
                Modificar Carrera / Licenciatura
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clave / Siglas
              </label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="ej. ISW, LAE"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Carrera / Licenciatura
              </label>
              <input
                type="text"
                required
                placeholder="ej. Licenciatura en Inteligencia Artificial"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Área de Conocimiento
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                <option value="Tecnología e Informática">Tecnología e Informática</option>
                <option value="Negocios y Finanzas">Negocios y Finanzas</option>
                <option value="Ciencias Sociales y Humanidades">Ciencias Sociales y Humanidades</option>
                <option value="Salud y Bienestar">Salud y Bienestar</option>
                <option value="Diseño y Comunicación">Diseño y Comunicación</option>
                <option value="Ingeniería y Manufactura">Ingeniería y Manufactura</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total de Cuatrimestres
              </label>
              <select
                value={totalCuatrimestres}
                onChange={(e) => setTotalCuatrimestres(Number(e.target.value))}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                {[3, 6, 8, 9, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n} Cuatrimestres ({Math.round((n / 3) * 10) / 10} años)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de RVOE Oficial
              </label>
              <input
                type="text"
                placeholder="ej. SEP-DGAIR/2021-0849"
                value={rvoe}
                onChange={(e) => setRvoe(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Director(a) / Coordinador(a)
              </label>
              <input
                type="text"
                placeholder="ej. Dr. Roberto Mendoza"
                value={directorCarrera}
                onChange={(e) => setDirectorCarrera(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Modalidades que oferta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Modalidades Habilitadas para esta Carrera
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['escolarizado', 'ejecutivo', 'a_distancia'] as ModalidadId[]).map((m) => {
                const info = MODALIDADES_CATALOGO[m];
                const isSelected = modalidades.includes(m);

                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleModalidad(m)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{info.nombre}</div>
                      <div
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {m === 'escolarizado'
                          ? 'Presencial L-V'
                          : m === 'ejecutivo'
                          ? 'Sábados intensivo'
                          : 'Virtual 24/7'}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
            {onOpenCurriculumPlan && licenciatura && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCurriculumPlan(licenciatura);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Gestionar Asignaturas por Cuatrimestre</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
