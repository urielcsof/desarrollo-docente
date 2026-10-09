import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  BookOpen, 
  UserCheck, 
  UserX, 
  Clock, 
  Star, 
  Calendar, 
  Layers, 
  Trash2, 
  Check, 
  Sparkles,
  Users,
  Search,
  AlertCircle
} from 'lucide-react';
import { 
  AsignacionDocente, 
  Asignatura, 
  DatabaseState, 
  Grupo, 
  Licenciatura, 
  Profesor, 
  Usuario 
} from '../types/database';
import { 
  calcularAntiguedad, 
  formatearCalificacion, 
  obtenerCategoriaDesempeno 
} from '../utils/academicHelpers';

interface CurriculumPlanModalProps {
  isOpen: boolean;
  licenciatura: Licenciatura | null;
  db: DatabaseState;
  currentUser: Usuario;
  onClose: () => void;
  onAddAsignatura: (
    asigData: Omit<Asignatura, 'id'>,
    asignacionInfo?: {
      profesorId: string;
      horario?: string;
      grupoId?: string;
    }
  ) => void;
  onDeleteAsignatura: (asignaturaId: string) => void;
  onOpenAssignModal: (params: {
    asignatura: Asignatura;
    grupo: Grupo;
    asignacionActual?: AsignacionDocente;
  }) => void;
  onGenerateGroups: (licenciaturaId: string) => void;
  onDeleteAsignacion: (asignacionId: string) => void;
}

export const CurriculumPlanModal: React.FC<CurriculumPlanModalProps> = ({
  isOpen,
  licenciatura,
  db,
  currentUser,
  onClose,
  onAddAsignatura,
  onDeleteAsignatura,
  onOpenAssignModal,
  onGenerateGroups,
  onDeleteAsignacion,
}) => {
  if (!isOpen || !licenciatura) return null;

  const isAdmin = currentUser.rol === 'administrador';
  const totalCuats = licenciatura.totalCuatrimestres || 9;
  const cuatrimestreList = Array.from({ length: totalCuats }, (_, i) => i + 1);

  // Cuatrimestre tab selection
  const [selectedCuatrimestre, setSelectedCuatrimestre] = useState<number | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Show inline add subject form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCuatrimestre, setNewCuatrimestre] = useState<number>(1);
  const [newClave, setNewClave] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newCreditos, setNewCreditos] = useState(8);
  const [newHoras, setNewHoras] = useState(5);
  const [newArea, setNewArea] = useState('Especialidad');
  const [newProfesorId, setNewProfesorId] = useState('');
  const [newHorario, setNewHorario] = useState('Lun y Mié 08:00 - 10:00 hrs');
  const [formSuccess, setFormSuccess] = useState(false);

  // Quick assign inline modal/popover
  const [quickAssignAsig, setQuickAssignAsig] = useState<Asignatura | null>(null);
  const [quickProfId, setQuickProfId] = useState(db.profesores[0]?.id || '');
  const [quickHorario, setQuickHorario] = useState('Lun y Mié 08:00 - 10:00 hrs');

  // Subjects for this licenciatura
  const materiasLic = db.asignaturas.filter((a) => a.licenciaturaId === licenciatura.id);

  // Grupos for this licenciatura
  const gruposLic = db.grupos.filter((g) => g.licenciaturaId === licenciatura.id);

  // Asignaciones for this licenciatura
  const asignacionesLic = db.asignaciones.filter((as) => as.licenciaturaId === licenciatura.id);

  const materiasFiltradas = materiasLic.filter((m) => {
    if (selectedCuatrimestre !== 'todos' && m.cuatrimestre !== selectedCuatrimestre) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return m.nombre.toLowerCase().includes(q) || m.clave.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAddForCuatrimestre = (cuat: number) => {
    setNewCuatrimestre(cuat);
    // Auto-generate suggested subject key e.g. IAI-101
    const countInCuat = materiasLic.filter((m) => m.cuatrimestre === cuat).length + 1;
    setNewClave(`${licenciatura.codigo}-${cuat}0${countInCuat}`);
    setNewNombre('');
    setNewProfesorId('');
    setShowAddForm(true);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClave || !newNombre) return;

    onAddAsignatura(
      {
        licenciaturaId: licenciatura.id,
        cuatrimestre: newCuatrimestre,
        clave: newClave.toUpperCase().trim(),
        nombre: newNombre.trim(),
        creditos: Number(newCreditos),
        horasSemanales: Number(newHoras),
        areaCurricular: newArea.trim(),
      },
      newProfesorId
        ? {
            profesorId: newProfesorId,
            horario: newHorario.trim(),
          }
        : undefined
    );

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
      setNewNombre('');
      setNewClave('');
      setNewProfesorId('');
    }, 1500);
  };

  const handleQuickAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssignAsig || !quickProfId) return;

    // Find or create group for this subject
    let grp = db.grupos.find(
      (g) =>
        g.licenciaturaId === licenciatura.id &&
        g.cuatrimestre === quickAssignAsig.cuatrimestre
    );

    if (!grp) {
      // Prompt user or generate default
      onGenerateGroups(licenciatura.id);
      // Try finding or use default group logic
      grp = db.grupos.find(
        (g) =>
          g.licenciaturaId === licenciatura.id &&
          g.cuatrimestre === quickAssignAsig.cuatrimestre
      );
    }

    if (grp) {
      onOpenAssignModal({
        asignatura: quickAssignAsig,
        grupo: grp,
      });
    } else {
      // Fallback: create assignment directly via onAddAsignatura helper or open standard modal
      onAddAsignatura(
        {
          licenciaturaId: quickAssignAsig.licenciaturaId,
          cuatrimestre: quickAssignAsig.cuatrimestre,
          clave: quickAssignAsig.clave,
          nombre: quickAssignAsig.nombre,
          creditos: quickAssignAsig.creditos,
          horasSemanales: quickAssignAsig.horasSemanales,
          areaCurricular: quickAssignAsig.areaCurricular,
        },
        {
          profesorId: quickProfId,
          horario: quickHorario,
        }
      );
    }

    setQuickAssignAsig(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {licenciatura.codigo}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  Plan de Estudios por Cuatrimestre
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {licenciatura.nombre}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddForCuatrimestre(typeof selectedCuatrimestre === 'number' ? selectedCuatrimestre : 1)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Agregar Asignatura</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* METRICS & QUICK SUMMARY BAR */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div>
              <span className="text-slate-400">Cuatrimestres:</span>{' '}
              <span className="font-bold text-slate-800">{totalCuats}</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div>
              <span className="text-slate-400">Materias Totales:</span>{' '}
              <span className="font-bold text-slate-800">{materiasLic.length}</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div>
              <span className="text-slate-400">Con Docente Asignado:</span>{' '}
              <span className="font-bold text-emerald-700">
                {materiasLic.filter((m) => asignacionesLic.some((as) => as.asignaturaId === m.id)).length}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div>
              <span className="text-slate-400">Vacantes:</span>{' '}
              <span className="font-bold text-amber-700">
                {materiasLic.filter((m) => !asignacionesLic.some((as) => as.asignaturaId === m.id)).length}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div>
              <span className="text-slate-400">Grupos Activos:</span>{' '}
              <span className="font-bold text-slate-800">{gruposLic.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {gruposLic.length === 0 && (
              <button
                onClick={() => onGenerateGroups(licenciatura.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Crea los grupos escolares para que aparezcan en la Malla Curricular"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Generar Grupos Escolares</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAddForCuatrimestre(typeof selectedCuatrimestre === 'number' ? selectedCuatrimestre : 1)}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Materia</span>
            </button>
          </div>
        </div>

        {/* CUATRIMESTRE NAVIGATION TABS & SEARCH */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          {/* Scrollable cuatrimestre pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCuatrimestre('todos')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCuatrimestre === 'todos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los Cuatrimestres ({materiasLic.length})
            </button>

            {cuatrimestreList.map((c) => {
              const count = materiasLic.filter((m) => m.cuatrimestre === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCuatrimestre(c)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCuatrimestre === c
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{c}º Cuat.</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCuatrimestre === c
                        ? 'bg-blue-800 text-white'
                        : count > 0
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar materia o clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5"
            />
          </div>
        </div>

        {/* BODY CONTENT: SCROLLABLE */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* INLINE FORM: AGREGAR NUEVA ASIGNATURA */}
          {showAddForm && (
            <div className="bg-blue-50/60 border-2 border-blue-200 rounded-xl p-5 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    +
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Añadir Asignatura al {newCuatrimestre}º Cuatrimestre de {licenciatura.nombre}
                  </h4>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-blue-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formSuccess && (
                <div className="p-3 mb-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Asignatura registrada y profesor asignado exitosamente!</span>
                </div>
              )}

              <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cuatrimestre
                    </label>
                    <select
                      value={newCuatrimestre}
                      onChange={(e) => {
                        const c = Number(e.target.value);
                        setNewCuatrimestre(c);
                        const countInCuat = materiasLic.filter((m) => m.cuatrimestre === c).length + 1;
                        setNewClave(`${licenciatura.codigo}-${c}0${countInCuat}`);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                    >
                      {cuatrimestreList.map((c) => (
                        <option key={c} value={c}>
                          {c}º Cuatrimestre
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clave de Materia
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`ej. ${licenciatura.codigo}-101`}
                      value={newClave}
                      onChange={(e) => setNewClave(e.target.value)}
                      className="w-full font-mono uppercase bg-white border border-slate-300 rounded-lg p-2 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre Oficial de la Asignatura
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Fundamentos de Redes y Telecomunicaciones"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Área Curricular
                    </label>
                    <select
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2"
                    >
                      <option value="Especialidad">Especialidad</option>
                      <option value="Ciencias Básicas">Ciencias Básicas</option>
                      <option value="Formación Profesional">Formación Profesional</option>
                      <option value="Metodología e Investigación">Metodología e Investigación</option>
                      <option value="Humanidades y Ética">Humanidades y Ética</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Créditos
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newCreditos}
                      onChange={(e) => setNewCreditos(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Horas Semanales
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={newHoras}
                      onChange={(e) => setNewHoras(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                {/* ASIGNACIÓN DOCENTE INMEDIATA */}
                <div className="p-3.5 bg-white rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      Asignar Profesor Titular (Opcional - Puede asignarse ahora o después)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Plantilla: {db.profesores.length} docentes disponibles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Profesor Asignado
                      </label>
                      <select
                        value={newProfesorId}
                        onChange={(e) => setNewProfesorId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        <option value="">-- Sin Asignar (Dejar Vacante) --</option>
                        {db.profesores.map((p) => {
                          const promedio = (p.calificacionAlumnos + p.calificacionCoordinacion) / 2;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.nombre} ({p.gradoAcademico}) · {p.especialidad} · ★ {promedio.toFixed(1)}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {newProfesorId && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Horario de Impartición
                        </label>
                        <input
                          type="text"
                          value={newHorario}
                          onChange={(e) => setNewHorario(e.target.value)}
                          placeholder="ej. Lun y Mié 08:00 - 10:00 hrs"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Asignatura y Asignación</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTADO DE MATERIAS POR CUATRIMESTRE */}
          {materiasLic.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Esta licenciatura aún no tiene asignaturas registradas
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Comienza agregando las materias correspondientes a cada cuatrimestre y asigna a los profesores encargados.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => handleOpenAddForCuatrimestre(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Agregar Materia a 1º Cuatrimestre</span>
                </button>
                {gruposLic.length === 0 && (
                  <button
                    onClick={() => onGenerateGroups(licenciatura.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Generar Grupos Escolares</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Render cuatrimestres
            <div className="space-y-6">
              {cuatrimestreList
                .filter((c) => selectedCuatrimestre === 'todos' || selectedCuatrimestre === c)
                .map((cuat) => {
                  const materiasDeEsteCuat = materiasFiltradas.filter((m) => m.cuatrimestre === cuat);
                  const totalHoras = materiasDeEsteCuat.reduce((acc, m) => acc + m.horasSemanales, 0);
                  const totalCred = materiasDeEsteCuat.reduce((acc, m) => acc + m.creditos, 0);

                  return (
                    <div
                      key={cuat}
                      className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                    >
                      {/* Cuatrimestre Section Header */}
                      <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-xs text-white">
                            {cuat}º
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {cuat}º Cuatrimestre
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {materiasDeEsteCuat.length} materias · {totalHoras} hrs/sem · {totalCred} créditos
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenAddForCuatrimestre(cuat)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-200 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-slate-700"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Agregar Materia a {cuat}º Cuat.</span>
                        </button>
                      </div>

                      {/* Asignaturas in this Cuatrimestre */}
                      {materiasDeEsteCuat.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          <span>No hay materias registradas para el {cuat}º Cuatrimestre. </span>
                          <button
                            onClick={() => handleOpenAddForCuatrimestre(cuat)}
                            className="text-blue-600 font-semibold underline ml-1 hover:text-blue-800"
                          >
                            Haga clic aquí para añadir una.
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {materiasDeEsteCuat.map((materia) => {
                            // Find assignments for this subject
                            const asignacion = asignacionesLic.find((a) => a.asignaturaId === materia.id);
                            const profesor = asignacion
                              ? db.profesores.find((p) => p.id === asignacion.profesorId)
                              : undefined;

                            const grupoAsociado = asignacion
                              ? db.grupos.find((g) => g.id === asignacion.grupoId)
                              : db.grupos.find(
                                  (g) =>
                                    g.licenciaturaId === licenciatura.id &&
                                    g.cuatrimestre === materia.cuatrimestre
                                );

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
                                  {/* INFO ASIGNATURA (5 cols) */}
                                  <div className="lg:col-span-5 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                        {materia.clave}
                                      </span>
                                      <span className="text-xs text-slate-500 font-medium">
                                        {materia.areaCurricular}
                                      </span>
                                    </div>

                                    <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                      {materia.nombre}
                                    </h5>

                                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                      <span>{materia.horasSemanales} hrs/sem</span>
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

                                  {/* PROFESOR ASIGNADO (5 cols) */}
                                  <div className="lg:col-span-5">
                                    {profesor ? (
                                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                            {profesor.nombre
                                              .split(' ')
                                              .map((n) => n[0])
                                              .filter(Boolean)
                                              .slice(0, 2)
                                              .join('')}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-xs font-bold text-slate-900 truncate">
                                                {profesor.nombre}
                                              </span>
                                              <span className="text-[10px] text-slate-500">
                                                ({profesor.gradoAcademico})
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                              <span className="truncate">{profesor.especialidad}</span>
                                              <span aria-hidden="true">·</span>
                                              <span className="flex items-center gap-0.5 font-bold text-slate-800">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                {formatearCalificacion(
                                                  (profesor.calificacionAlumnos + profesor.calificacionCoordinacion) / 2
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => {
                                              if (grupoAsociado) {
                                                onOpenAssignModal({
                                                  asignatura: materia,
                                                  grupo: grupoAsociado,
                                                  asignacionActual: asignacion,
                                                });
                                              }
                                            }}
                                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                                            title="Cambiar o reasignar profesor"
                                          >
                                            Cambiar
                                          </button>
                                          {asignacion && (
                                            <button
                                              onClick={() => onDeleteAsignacion(asignacion.id)}
                                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                              title="Quitar asignación docente"
                                            >
                                              <UserX className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                          <div>
                                            <span className="text-xs font-semibold text-amber-900 block">
                                              Vacante (Sin Profesor Asignado)
                                            </span>
                                            <span className="text-[11px] text-amber-700">
                                              Esta materia requiere titular docente
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => {
                                            if (grupoAsociado) {
                                              onOpenAssignModal({
                                                asignatura: materia,
                                                grupo: grupoAsociado,
                                              });
                                            } else {
                                              // Quick assign inline
                                              setQuickAssignAsig(materia);
                                            }
                                          }}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors shrink-0"
                                        >
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span>Asignar Profesor</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* ACCIONES Y BAJA (2 cols) */}
                                  <div className="lg:col-span-2 flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => onDeleteAsignatura(materia.id)}
                                      className={`p-1.5 rounded transition-colors inline-flex items-center gap-1 text-xs ${
                                        isAdmin
                                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                          : 'text-slate-300'
                                      }`}
                                      title={
                                        isAdmin
                                          ? `Dar de baja ${materia.nombre}`
                                          : 'Solo el administrador URIEL puede dar de baja asignaturas'
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Eliminar</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* QUICK ASSIGN POPUP IF NO GROUP FOUND */}
        {quickAssignAsig && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Asignar Profesor a {quickAssignAsig.nombre}
                </h4>
                <button
                  onClick={() => setQuickAssignAsig(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAssignSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Seleccionar Docente Titular
                  </label>
                  <select
                    value={quickProfId}
                    onChange={(e) => setQuickProfId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {db.profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.gradoAcademico}) · {p.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Horario de Impartición
                  </label>
                  <input
                    type="text"
                    value={quickHorario}
                    onChange={(e) => setQuickHorario(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAssignAsig(null)}
                    className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-white bg-slate-900 rounded-lg font-semibold"
                  >
                    Confirmar Asignación
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
