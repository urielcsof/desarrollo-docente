import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Clock,
  Star,
  Edit3
} from 'lucide-react';
import { 
  DatabaseState, 
  FiltrosBusqueda, 
  ModalidadId,
  Licenciatura 
} from '../types/database';
import { MODALIDADES_CATALOGO } from '../utils/academicHelpers';

interface FilterBarProps {
  filtros: FiltrosBusqueda;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosBusqueda>>;
  db: DatabaseState;
  totalResultados: number;
  onOpenEditLicenciatura?: (lic: Licenciatura) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filtros,
  setFiltros,
  db,
  totalResultados,
  onOpenEditLicenciatura,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Grupos disponibles según licenciatura, modalidad y cuatrimestre actuales
  const gruposFiltrados = db.grupos.filter((g) => {
    if (filtros.licenciaturaId !== 'todas' && g.licenciaturaId !== filtros.licenciaturaId) {
      return false;
    }
    if (filtros.modalidad !== 'todas' && g.modalidad !== filtros.modalidad) {
      return false;
    }
    if (filtros.cuatrimestre !== 'todos' && g.cuatrimestre !== filtros.cuatrimestre) {
      return false;
    }
    return true;
  });

  const handleReset = () => {
    setFiltros({
      licenciaturaId: 'todas',
      modalidad: 'todas',
      cuatrimestre: 'todos',
      grupoId: 'todos',
      busquedaTexto: '',
      rangoAntiguedad: 'todas',
      rangoCalificacion: 'todas',
      ordenarPor: 'calificacion_desc',
    });
  };

  const hasActiveFilters =
    filtros.licenciaturaId !== 'todas' ||
    filtros.modalidad !== 'todas' ||
    filtros.cuatrimestre !== 'todos' ||
    filtros.grupoId !== 'todos' ||
    filtros.busquedaTexto.trim() !== '' ||
    filtros.rangoAntiguedad !== 'todas' ||
    filtros.rangoCalificacion !== 'todas';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs mb-6 overflow-hidden">
      {/* Top Primary Filters Row */}
      <div className="p-4 space-y-4">
        {/* Cascade Dropdowns & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* 1. Licenciatura */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                1. Licenciatura / Carrera
              </label>
              {filtros.licenciaturaId !== 'todas' && onOpenEditLicenciatura && (
                <button
                  type="button"
                  onClick={() => {
                    const l = db.licenciaturas.find((item) => item.id === filtros.licenciaturaId);
                    if (l) onOpenEditLicenciatura(l);
                  }}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  title="Modificar datos curriculares de la carrera seleccionada"
                >
                  <Edit3 className="w-3 h-3 text-blue-600" />
                  <span>Modificar Carrera</span>
                </button>
              )}
            </div>
            <select
              value={filtros.licenciaturaId}
              onChange={(e) => {
                const newLicId = e.target.value;
                setFiltros((prev) => ({
                  ...prev,
                  licenciaturaId: newLicId,
                  // reset grupo if no longer valid
                  grupoId: 'todos',
                }));
              }}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer truncate"
            >
              <option value="todas">Todas las Licenciaturas ({db.licenciaturas.length})</option>
              {db.licenciaturas.map((lic) => (
                <option key={lic.id} value={lic.id}>
                  [{lic.codigo}] {lic.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Cuatrimestre */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Cuatrimestre
            </label>
            <select
              value={filtros.cuatrimestre}
              onChange={(e) => {
                const val = e.target.value === 'todos' ? 'todos' : Number(e.target.value);
                setFiltros((prev) => ({
                  ...prev,
                  cuatrimestre: val,
                  grupoId: 'todos',
                }));
              }}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="todos">Todos (1º al 9º)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                <option key={c} value={c}>
                  {c}º Cuatrimestre
                </option>
              ))}
            </select>
          </div>

          {/* 3. Grupo Específico */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Grupo Específico
            </label>
            <select
              value={filtros.grupoId}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, grupoId: e.target.value }))
              }
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="todos">
                {gruposFiltrados.length === 0
                  ? 'Sin grupos con estos filtros'
                  : `Todos los grupos (${gruposFiltrados.length})`}
              </option>
              {gruposFiltrados.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.codigo} · {g.cuatrimestre}º Cuat. ({g.turno})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Buscador por Texto */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Búsqueda en vivo
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Docente, materia, clave..."
                value={filtros.busquedaTexto}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    busquedaTexto: e.target.value,
                  }))
                }
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Modalidades Segmented Control */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 shrink-0">
              Modalidad:
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  setFiltros((prev) => ({
                    ...prev,
                    modalidad: 'todas',
                    grupoId: 'todos',
                  }))
                }
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  filtros.modalidad === 'todas'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({db.grupos.length})
              </button>
              {(['escolarizado', 'ejecutivo', 'a_distancia'] as ModalidadId[]).map(
                (modId) => {
                  const info = MODALIDADES_CATALOGO[modId];
                  const count = db.grupos.filter((g) => g.modalidad === modId).length;
                  const isSelected = filtros.modalidad === modId;
                  return (
                    <button
                      key={modId}
                      type="button"
                      onClick={() =>
                        setFiltros((prev) => ({
                          ...prev,
                          modalidad: modId,
                          grupoId: 'todos',
                        }))
                      }
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{info.nombre}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({count})
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Action buttons (Advanced toggle & Reset) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros Docente</span>
              {showAdvanced ? (
                <ChevronUp className="w-3 h-3 text-slate-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters (Antigüedad, Calificación, Orden) */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filtro Antigüedad */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Antigüedad Docente
              </label>
              <select
                value={filtros.rangoAntiguedad}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    rangoAntiguedad: e.target.value as FiltrosBusqueda['rangoAntiguedad'],
                  }))
                }
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                <option value="todas">Cualquier antigüedad</option>
                <option value="mas_6">Más de 6 años (Senior)</option>
                <option value="3_6">De 3 a 6 años (Consolidado)</option>
                <option value="1_3">De 1 a 3 años (Intermedio)</option>
                <option value="menos_1">Menos de 1 año (Nuevo ingreso)</option>
              </select>
            </div>

            {/* Filtro Calificación */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Desempeño / Calificación
              </label>
              <select
                value={filtros.rangoCalificacion}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    rangoCalificacion: e.target.value as FiltrosBusqueda['rangoCalificacion'],
                  }))
                }
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                <option value="todas">Cualquier calificación</option>
                <option value="foco_rojo">🚨 Foco Rojo Crítico (≤ 7.0)</option>
                <option value="debajo_9">⚠️ Requiere Capacitación (&lt; 9.0)</option>
                <option value="sobresaliente">Excelente (≥ 9.5)</option>
                <option value="bueno">Sobresaliente (8.8 - 9.4)</option>
                <option value="regular">Aceptable (8.0 - 8.7)</option>
                <option value="alerta">Por debajo de 8.0</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ordenar Resultados
              </label>
              <select
                value={filtros.ordenarPor}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    ordenarPor: e.target.value as FiltrosBusqueda['ordenarPor'],
                  }))
                }
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                <option value="calificacion_desc">Mayor calificación primero</option>
                <option value="calificacion_asc">Menor calificación primero</option>
                <option value="antiguedad_desc">Mayor antigüedad primero</option>
                <option value="nombre_asc">Alfabético por nombre (A-Z)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Bar indicator */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">
            {totalResultados}{' '}
            {totalResultados === 1 ? 'coincidencia encontrada' : 'coincidencias encontradas'}
          </span>
          {filtros.licenciaturaId !== 'todas' && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600 truncate max-w-xs">
                {db.licenciaturas.find((l) => l.id === filtros.licenciaturaId)?.nombre}
              </span>
            </>
          )}
          {filtros.modalidad !== 'todas' && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-medium text-slate-700">
                {MODALIDADES_CATALOGO[filtros.modalidad].nombre}
              </span>
            </>
          )}
          {filtros.cuatrimestre !== 'todos' && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-700">{filtros.cuatrimestre}º Cuatrimestre</span>
            </>
          )}
          {filtros.grupoId !== 'todos' && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-800 font-semibold">
                Grupo {db.grupos.find((g) => g.id === filtros.grupoId)?.codigo}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
