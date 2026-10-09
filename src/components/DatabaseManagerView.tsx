import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  PlusCircle, 
  Check, 
  Trash2,
  Lock,
  Database,
  BookOpen,
  GraduationCap,
  Edit3
} from 'lucide-react';
import { AsignacionDocente, Asignatura, DatabaseState, Grupo, Licenciatura, ModalidadId, Usuario } from '../types/database';
import { DeleteItemTarget } from './DeleteConfirmModal';
import { MODALIDADES_CATALOGO } from '../utils/academicHelpers';

interface DatabaseManagerViewProps {
  db: DatabaseState;
  currentUser: Usuario;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (jsonText: string) => void;
  onResetSeed: () => void;
  onAddAsignatura: (
    asig: Omit<Asignatura, 'id'>,
    asignacionInfo?: { profesorId: string; horario?: string; grupoId?: string }
  ) => void;
  onAddGrupo: (grupo: Omit<Grupo, 'id'>) => void;
  onOpenNewLicenciatura: () => void;
  onOpenEditLicenciatura: (lic: Licenciatura) => void;
  onOpenCurriculumPlan?: (lic: Licenciatura) => void;
  onOpenAssignModal?: (params: {
    asignatura: Asignatura;
    grupo: Grupo;
    asignacionActual?: AsignacionDocente;
  }) => void;
  onRequestDelete: (target: DeleteItemTarget) => void;
}

export const DatabaseManagerView: React.FC<DatabaseManagerViewProps> = ({
  db,
  currentUser,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onResetSeed,
  onAddAsignatura,
  onAddGrupo,
  onOpenNewLicenciatura,
  onOpenEditLicenciatura,
  onOpenCurriculumPlan,
  onOpenAssignModal,
  onRequestDelete,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'licenciaturas' | 'asignaturas' | 'nuevo_grupo'>('status');

  const isAdmin = currentUser.rol === 'administrador';

  // Filtro búsqueda asignaturas
  const [searchAsig, setSearchAsig] = useState('');
  const [filterLicAsig, setFilterLicAsig] = useState('todas');

  // Form nueva asignatura
  const [asigLicId, setAsigLicId] = useState(db.licenciaturas[0]?.id || '');
  const [asigCuatrimestre, setAsigCuatrimestre] = useState(1);
  const [asigClave, setAsigClave] = useState('');
  const [asigNombre, setAsigNombre] = useState('');
  const [asigCreditos, setAsigCreditos] = useState(8);
  const [asigHoras, setAsigHoras] = useState(5);
  const [asigArea, setAsigArea] = useState('Especialidad');
  const [asigProfesorId, setAsigProfesorId] = useState('');
  const [asigHorario, setAsigHorario] = useState('Lun y Mié 08:00 - 10:00 hrs');
  const [asigSuccess, setAsigSuccess] = useState(false);

  // Form nuevo grupo
  const [grpLicId, setGrpLicId] = useState(db.licenciaturas[0]?.id || '');
  const [grpModalidad, setGrpModalidad] = useState<ModalidadId>('escolarizado');
  const [grpCuatrimestre, setGrpCuatrimestre] = useState(1);
  const [grpCodigo, setGrpCodigo] = useState('');
  const [grpTurno, setGrpTurno] = useState<Grupo['turno']>('Matutino');
  const [grpAula, setGrpAula] = useState('Edificio Central Aula 101');
  const [grpCupo, setGrpCupo] = useState(30);
  const [grpSuccess, setGrpSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJSON(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateAsignatura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asigClave || !asigNombre) return;

    onAddAsignatura(
      {
        licenciaturaId: asigLicId,
        cuatrimestre: asigCuatrimestre,
        clave: asigClave.toUpperCase(),
        nombre: asigNombre,
        creditos: asigCreditos,
        horasSemanales: asigHoras,
        areaCurricular: asigArea,
      },
      asigProfesorId
        ? {
            profesorId: asigProfesorId,
            horario: asigHorario,
          }
        : undefined
    );

    setAsigClave('');
    setAsigNombre('');
    setAsigProfesorId('');
    setAsigSuccess(true);
    setTimeout(() => setAsigSuccess(false), 3000);
  };

  const handleCreateGrupo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grpCodigo) return;

    onAddGrupo({
      codigo: grpCodigo.toUpperCase(),
      licenciaturaId: grpLicId,
      modalidad: grpModalidad,
      cuatrimestre: grpCuatrimestre,
      turno: grpTurno,
      cicloEscolar: '2026-C3',
      aula: grpAula,
      cupoAlumnos: grpCupo,
    });

    setGrpCodigo('');
    setGrpSuccess(true);
    setTimeout(() => setGrpSuccess(false), 3000);
  };

  // Filtrado de asignaturas en el subtab
  const asignaturasFiltradas = db.asignaturas.filter((a) => {
    if (filterLicAsig !== 'todas' && a.licenciaturaId !== filterLicAsig) return false;
    if (searchAsig.trim()) {
      const q = searchAsig.toLowerCase();
      return a.nombre.toLowerCase().includes(q) || a.clave.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('status')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'status'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Estado y Respaldo
        </button>
        <button
          onClick={() => setActiveSubTab('licenciaturas')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'licenciaturas'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Carreras y Licenciaturas ({db.licenciaturas.length})
        </button>
        <button
          onClick={() => setActiveSubTab('asignaturas')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'asignaturas'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Malla de Asignaturas ({db.asignaturas.length})
        </button>
        <button
          onClick={() => setActiveSubTab('nuevo_grupo')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'nuevo_grupo'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          + Crear Grupo
        </button>
      </div>

      {/* SUBTAB 1: ESTADO Y RESPALDO */}
      {activeSubTab === 'status' && (
        <div className="space-y-6">
          {/* Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Licenciaturas</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {db.licenciaturas.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Docentes en Plantilla</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {db.profesores.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Asignaturas Registradas</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {db.asignaturas.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Grupos Escolares</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {db.grupos.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Asignaciones Activas</span>
              <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {db.asignaciones.length}
              </span>
            </div>
          </div>

          {/* Backup & Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exportaciones */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                Exportación de Datos
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Descarga una copia completa de la base de datos o genera el archivo CSV con la matriz docente para Excel.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={onExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Exportar Docentes a CSV</span>
                </button>

                <button
                  onClick={onExportJSON}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Descargar Respaldo JSON</span>
                </button>
              </div>
            </div>

            {/* Importación y Reset */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Restauración e Importación
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Carga un respaldo previo en formato JSON o restablece el estado a los datos universitarios de prueba.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Importar Archivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        '¿Deseas restaurar la base de datos a los valores de prueba originales? Esta acción reemplazará los datos actuales.'
                      )
                    ) {
                      onResetSeed();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Restablecer Datos Iniciales</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: GESTIÓN DE LICENCIATURAS / CARRERAS */}
      {activeSubTab === 'licenciaturas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Catálogo de Licenciaturas y Carreras
              </h3>
              <p className="text-xs text-slate-500">
                Cualquier usuario puede dar de alta nuevas carreras. Solo el administrador URIEL puede dar de baja.
              </p>
            </div>
            <button
              onClick={onOpenNewLicenciatura}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Alta de Carrera</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {db.licenciaturas.map((lic) => {
              const materiasCount = db.asignaturas.filter((a) => a.licenciaturaId === lic.id).length;
              const gruposCount = db.grupos.filter((g) => g.licenciaturaId === lic.id).length;

              return (
                <div
                  key={lic.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {lic.codigo}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {lic.totalCuatrimestres} Cuatrimestres
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {lic.nombre}
                    </h4>

                    <span className="text-[11px] text-slate-600 block mb-2">
                      Área: {lic.area}
                    </span>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 mb-3">
                      <div className="text-[11px] text-slate-500">
                        RVOE: <span className="font-mono text-slate-800 font-semibold">{lic.rvoe}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Director: <span className="text-slate-800">{lic.directorCarrera}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-700 font-medium">
                        <span>{materiasCount} materias</span>
                        <span aria-hidden="true">·</span>
                        <span>{gruposCount} grupos</span>
                      </div>
                    </div>

                    {/* BOTÓN GESTIÓN PLAN DE ESTUDIOS Y PROFESORES */}
                    {onOpenCurriculumPlan && (
                      <button
                        onClick={() => onOpenCurriculumPlan(lic)}
                        className="w-full mb-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-2xs"
                        title={`Gestionar asignaturas por cuatrimestre y asignar profesores para ${lic.nombre}`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Plan de Estudios y Docentes ({materiasCount})</span>
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {lic.modalidadesDisponibles.map((m) => (
                        <span
                          key={m}
                          className="text-[9px] px-1.5 py-0.2 rounded border bg-slate-100 text-slate-700"
                        >
                          {MODALIDADES_CATALOGO[m]?.nombre?.substring(0, 3)}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenEditLicenciatura(lic)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors shadow-2xs"
                        title={`Modificar datos curriculares de ${lic.nombre}`}
                      >
                        <Edit3 className="w-3 h-3 text-blue-600" />
                        <span>Modificar</span>
                      </button>

                      <button
                        onClick={() =>
                          onRequestDelete({
                            tipo: 'licenciatura',
                            id: lic.id,
                            nombre: lic.nombre,
                            detallesExtra: `Clave: ${lic.codigo} · RVOE: ${lic.rvoe}`,
                          })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                          isAdmin
                            ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                            : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
                        }`}
                        title={
                          isAdmin
                            ? `Dar de baja ${lic.nombre}`
                            : 'Solo el administrador URIEL puede dar de baja licenciaturas'
                        }
                      >
                        {isAdmin ? <Trash2 className="w-3 h-3 text-rose-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                        <span>Dar de Baja</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: GESTIÓN Y ALTA DE ASIGNATURAS */}
      {activeSubTab === 'asignaturas' && (
        <div className="space-y-6">
          {/* Form nueva asignatura */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Dar de Alta Nueva Asignatura en la Malla
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra una materia para que pueda ser asignada a profesores en los grupos correspondientes.
            </p>

            {asigSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Asignatura creada con éxito en la base de datos.</span>
              </div>
            )}

            <form onSubmit={handleCreateAsignatura} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Licenciatura
                  </label>
                  <select
                    value={asigLicId}
                    onChange={(e) => setAsigLicId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {db.licenciaturas.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.codigo}] {l.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cuatrimestre
                  </label>
                  <select
                    value={asigCuatrimestre}
                    onChange={(e) => setAsigCuatrimestre(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                      <option key={c} value={c}>
                        {c}º Cuatrimestre
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clave de Asignatura
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. ISW-703"
                    value={asigClave}
                    onChange={(e) => setAsigClave(e.target.value)}
                    className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre Oficial de la Materia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Inteligencia Artificial Generativa y LLMs"
                    value={asigNombre}
                    onChange={(e) => setAsigNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Créditos / Horas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={asigCreditos}
                      onChange={(e) => setAsigCreditos(Number(e.target.value))}
                      className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2"
                      title="Créditos"
                    />
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={asigHoras}
                      onChange={(e) => setAsigHoras(Number(e.target.value))}
                      className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2"
                      title="Horas semanales"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Área Curricular
                  </label>
                  <input
                    type="text"
                    value={asigArea}
                    onChange={(e) => setAsigArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Asignación Docente Opcional */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Asignación Docente Inmediata (Opcional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Profesor Titular
                    </label>
                    <select
                      value={asigProfesorId}
                      onChange={(e) => setAsigProfesorId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      <option value="">-- Sin asignar (Vacante) --</option>
                      {db.profesores.map((p) => {
                        const prom = (p.calificacionAlumnos + p.calificacionCoordinacion) / 2;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.gradoAcademico}) · {p.especialidad} (★ {prom.toFixed(1)})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {asigProfesorId && (
                    <div>
                      <label className="block text-slate-600 mb-1">
                        Horario Propuesto
                      </label>
                      <input
                        type="text"
                        value={asigHorario}
                        onChange={(e) => setAsigHorario(e.target.value)}
                        placeholder="ej. Lun y Mié 08:00 - 10:00 hrs"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Guardar Asignatura</span>
                </button>
              </div>
            </form>
          </div>

          {/* Listado con filtro y botón de baja */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Listado de Asignaturas Registradas ({asignaturasFiltradas.length})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterLicAsig}
                  onChange={(e) => setFilterLicAsig(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value="todas">Todas las licenciaturas</option>
                  {db.licenciaturas.map((l) => (
                    <option key={l.id} value={l.id}>
                      [{l.codigo}] {l.nombre}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Buscar materia..."
                  value={searchAsig}
                  onChange={(e) => setSearchAsig(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Clave</th>
                    <th className="py-2.5 px-3">Asignatura</th>
                    <th className="py-2.5 px-3">Carrera / Licenciatura</th>
                    <th className="py-2.5 px-3 text-center">Cuatrimestre</th>
                    <th className="py-2.5 px-3">Área Curricular</th>
                    <th className="py-2.5 px-3">Docente Titular</th>
                    <th className="py-2.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {asignaturasFiltradas.slice(0, 30).map((asig) => {
                    const lic = db.licenciaturas.find((l) => l.id === asig.licenciaturaId);
                    const asignacion = db.asignaciones.find((a) => a.asignaturaId === asig.id);
                    const profesor = asignacion ? db.profesores.find((p) => p.id === asignacion.profesorId) : undefined;
                    const grupoAsociado = asignacion 
                      ? db.grupos.find((g) => g.id === asignacion.grupoId)
                      : db.grupos.find((g) => g.licenciaturaId === asig.licenciaturaId && g.cuatrimestre === asig.cuatrimestre);

                    return (
                      <tr key={asig.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                          {asig.clave}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {asig.nombre}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {lic?.codigo} · {lic?.nombre}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {asig.cuatrimestre}º
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {asig.areaCurricular}
                        </td>
                        <td className="py-2.5 px-3">
                          {profesor ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 text-xs">
                                {profesor.nombre}
                              </span>
                              {onOpenAssignModal && grupoAsociado && (
                                <button
                                  onClick={() =>
                                    onOpenAssignModal({
                                      asignatura: asig,
                                      grupo: grupoAsociado,
                                      asignacionActual: asignacion,
                                    })
                                  }
                                  className="text-[10px] text-blue-600 hover:underline"
                                  title="Cambiar asignación docente"
                                >
                                  Cambiar
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Vacante
                              </span>
                              {onOpenAssignModal && grupoAsociado ? (
                                <button
                                  onClick={() =>
                                    onOpenAssignModal({
                                      asignatura: asig,
                                      grupo: grupoAsociado,
                                    })
                                  }
                                  className="text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                                >
                                  + Asignar
                                </button>
                              ) : lic && onOpenCurriculumPlan ? (
                                <button
                                  onClick={() => onOpenCurriculumPlan(lic)}
                                  className="text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                                >
                                  + Asignar
                                </button>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() =>
                              onRequestDelete({
                                tipo: 'asignatura',
                                id: asig.id,
                                nombre: `${asig.clave} · ${asig.nombre}`,
                                detallesExtra: `${lic?.nombre} · ${asig.cuatrimestre}º Cuatrimestre`,
                              })
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
                              isAdmin
                                ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
                            }`}
                            title={
                              isAdmin
                                ? 'Dar de baja esta asignatura'
                                : 'Solo el administrador URIEL puede dar de baja materias'
                            }
                          >
                            {isAdmin ? <Trash2 className="w-3 h-3 text-rose-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                            <span>Baja</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {asignaturasFiltradas.length > 30 && (
              <div className="p-2.5 bg-slate-50 text-center text-[11px] text-slate-500 border-t border-slate-100">
                Mostrando 30 de {asignaturasFiltradas.length} asignaturas. Usa el buscador para filtrar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: CREAR GRUPO */}
      {activeSubTab === 'nuevo_grupo' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Crear Nuevo Grupo Escolar
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Abre un grupo en una licenciatura, modalidad y cuatrimestre determinados.
          </p>

          {grpSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Grupo creado con éxito y listo para recibir asignaciones docentes.</span>
            </div>
          )}

          <form onSubmit={handleCreateGrupo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Licenciatura
                </label>
                <select
                  value={grpLicId}
                  onChange={(e) => setGrpLicId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  {db.licenciaturas.map((l) => (
                    <option key={l.id} value={l.id}>
                      [{l.codigo}] {l.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalidad
                </label>
                <select
                  value={grpModalidad}
                  onChange={(e) => setGrpModalidad(e.target.value as ModalidadId)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="escolarizado">Escolarizado</option>
                  <option value="ejecutivo">Ejecutivo</option>
                  <option value="a_distancia">A Distancia</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cuatrimestre
                </label>
                <select
                  value={grpCuatrimestre}
                  onChange={(e) => setGrpCuatrimestre(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                    <option key={c} value={c}>
                      {c}º Cuatrimestre
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Grupo
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. ISW-701-ESC"
                  value={grpCodigo}
                  onChange={(e) => setGrpCodigo(e.target.value)}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Turno
                </label>
                <select
                  value={grpTurno}
                  onChange={(e) => setGrpTurno(e.target.value as Grupo['turno'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Sabatino">Sabatino</option>
                  <option value="Virtual / Asíncrono">Virtual / Asíncrono</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cupo de Alumnos
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={grpCupo}
                  onChange={(e) => setGrpCupo(Number(e.target.value))}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aula o Espacio Asignado
              </label>
              <input
                type="text"
                value={grpAula}
                onChange={(e) => setGrpAula(e.target.value)}
                placeholder="ej. Campus Norte - Edif. B Aula 204"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Grupo</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
