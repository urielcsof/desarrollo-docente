/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DatabaseState, 
  FiltrosBusqueda, 
  Profesor, 
  AsignacionDocente, 
  Asignatura, 
  Grupo, 
  Usuario, 
  Licenciatura 
} from './types/database';
import { StorageService } from './services/storageService';
import { calcularAntiguedad } from './utils/academicHelpers';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { AcademicGrid } from './components/AcademicGrid';
import { ProfessorsDirectory } from './components/ProfessorsDirectory';
import { AnalyticsView } from './components/AnalyticsView';
import { DatabaseManagerView } from './components/DatabaseManagerView';
import { ProfessorModal } from './components/ProfessorModal';
import { AssignProfessorModal } from './components/AssignProfessorModal';
import { NewProfessorModal } from './components/NewProfessorModal';
import { EvaluateProfessorModal } from './components/EvaluateProfessorModal';
import { NewLicenciaturaModal } from './components/NewLicenciaturaModal';
import { EditLicenciaturaModal } from './components/EditLicenciaturaModal';
import { CurriculumPlanModal } from './components/CurriculumPlanModal';
import { UserManagementModal } from './components/UserManagementModal';
import { DeleteConfirmModal, DeleteItemTarget } from './components/DeleteConfirmModal';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  // Database state backed by LocalStorage
  const [db, setDb] = useState<DatabaseState>(() => StorageService.getDatabase());

  // Current logged in user: Start as null to always require login upon starting/entering the application
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'malla' | 'directorio' | 'analitica' | 'gestion'>('malla');

  // Cascading & Advanced Filters
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    licenciaturaId: 'todas',
    modalidad: 'todas',
    cuatrimestre: 'todos',
    grupoId: 'todos',
    busquedaTexto: '',
    rangoAntiguedad: 'todas',
    rangoCalificacion: 'todas',
    ordenarPor: 'calificacion_desc',
  });

  // Modals state
  const [selectedProfesor, setSelectedProfesor] = useState<Profesor | null>(null);
  const [evaluateProfesor, setEvaluateProfesor] = useState<Profesor | null>(null);
  const [isNewProfOpen, setIsNewProfOpen] = useState(false);
  const [isNewLicOpen, setIsNewLicOpen] = useState(false);
  const [editingLicenciatura, setEditingLicenciatura] = useState<Licenciatura | null>(null);
  const [curriculumPlanLicenciatura, setCurriculumPlanLicenciatura] = useState<Licenciatura | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteItemTarget | null>(null);
  const [assignModalParams, setAssignModalParams] = useState<{
    asignatura: Asignatura;
    grupo: Grupo;
    asignacionActual?: AsignacionDocente;
  } | null>(null);

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state to local storage when changed
  useEffect(() => {
    StorageService.saveDatabase(db);
  }, [db]);

  // FILTERED GROUPS for Academic Malla view
  const gruposFiltrados = useMemo(() => {
    return db.grupos.filter((grupo) => {
      if (filtros.licenciaturaId !== 'todas' && grupo.licenciaturaId !== filtros.licenciaturaId) {
        return false;
      }
      if (filtros.modalidad !== 'todas' && grupo.modalidad !== filtros.modalidad) {
        return false;
      }
      if (filtros.cuatrimestre !== 'todos' && grupo.cuatrimestre !== filtros.cuatrimestre) {
        return false;
      }
      if (filtros.grupoId !== 'todos' && grupo.id !== filtros.grupoId) {
        return false;
      }

      // Check text search
      if (filtros.busquedaTexto.trim()) {
        const query = filtros.busquedaTexto.toLowerCase();
        const codeMatch = grupo.codigo.toLowerCase().includes(query);
        const aulaMatch = grupo.aula.toLowerCase().includes(query);

        // check if any assigned subject or professor in this group matches
        const materiasGrupo = db.asignaturas.filter(
          (a) => a.licenciaturaId === grupo.licenciaturaId && a.cuatrimestre === grupo.cuatrimestre
        );
        const hasMatchingSubject = materiasGrupo.some(
          (m) => m.nombre.toLowerCase().includes(query) || m.clave.toLowerCase().includes(query)
        );

        const asignacionesGrupo = db.asignaciones.filter((a) => a.grupoId === grupo.id);
        const hasMatchingProfessor = asignacionesGrupo.some((a) => {
          const prof = db.profesores.find((p) => p.id === a.profesorId);
          return prof && prof.nombre.toLowerCase().includes(query);
        });

        if (!codeMatch && !aulaMatch && !hasMatchingSubject && !hasMatchingProfessor) {
          return false;
        }
      }

      return true;
    });
  }, [db, filtros]);

  // FILTERED PROFESSORS for Directory view
  const profesoresFiltrados = useMemo(() => {
    return db.profesores
      .filter((prof) => {
        const asignacionesProf = db.asignaciones.filter((a) => a.profesorId === prof.id);

        // Filter by Licenciatura
        if (filtros.licenciaturaId !== 'todas') {
          const teachesInLic = asignacionesProf.some(
            (a) => a.licenciaturaId === filtros.licenciaturaId
          );
          if (!teachesInLic) return false;
        }

        // Filter by Modalidad
        if (filtros.modalidad !== 'todas') {
          const teachesInMod = asignacionesProf.some(
            (a) => a.modalidad === filtros.modalidad
          );
          if (!teachesInMod) return false;
        }

        // Filter by Cuatrimestre
        if (filtros.cuatrimestre !== 'todos') {
          const teachesInCuat = asignacionesProf.some(
            (a) => a.cuatrimestre === filtros.cuatrimestre
          );
          if (!teachesInCuat) return false;
        }

        // Filter by Grupo
        if (filtros.grupoId !== 'todos') {
          const teachesInGroup = asignacionesProf.some(
            (a) => a.grupoId === filtros.grupoId
          );
          if (!teachesInGroup) return false;
        }

        // Filter by Seniority (Antigüedad)
        const antiguedad = calcularAntiguedad(prof.fechaIngreso);
        if (filtros.rangoAntiguedad === 'menos_1' && antiguedad.anios >= 1) {
          return false;
        }
        if (filtros.rangoAntiguedad === '1_3' && (antiguedad.anios < 1 || antiguedad.anios > 3)) {
          return false;
        }
        if (filtros.rangoAntiguedad === '3_6' && (antiguedad.anios < 3 || antiguedad.anios > 6)) {
          return false;
        }
        if (filtros.rangoAntiguedad === 'mas_6' && antiguedad.anios < 6) {
          return false;
        }

        // Filter by Calificación
        const promedio = (prof.calificacionAlumnos + prof.calificacionCoordinacion) / 2;
        if (filtros.rangoCalificacion === 'foco_rojo') {
          const esFocoRojo = promedio <= 7.0 || prof.calificacionAlumnos <= 7.0 || prof.calificacionCoordinacion <= 7.0;
          if (!esFocoRojo) return false;
        }
        if (filtros.rangoCalificacion === 'debajo_9') {
          const requiereCapacitacion = promedio < 9.0 || prof.calificacionAlumnos < 9.0 || prof.calificacionCoordinacion < 9.0;
          if (!requiereCapacitacion) return false;
        }
        if (filtros.rangoCalificacion === 'sobresaliente' && promedio < 9.5) {
          return false;
        }
        if (filtros.rangoCalificacion === 'bueno' && (promedio < 8.8 || promedio >= 9.5)) {
          return false;
        }
        if (filtros.rangoCalificacion === 'regular' && (promedio < 8.0 || promedio >= 8.8)) {
          return false;
        }
        if (filtros.rangoCalificacion === 'alerta' && promedio >= 8.0) {
          return false;
        }

        // Search text
        if (filtros.busquedaTexto.trim()) {
          const q = filtros.busquedaTexto.toLowerCase();
          const nameMatch = prof.nombre.toLowerCase().includes(q);
          const cedulaMatch = prof.cedula.toLowerCase().includes(q);
          const specMatch = prof.especialidad.toLowerCase().includes(q);
          const emailMatch = prof.correo.toLowerCase().includes(q);

          // match subject names taught
          const subjectMatch = asignacionesProf.some((a) => {
            const mat = db.asignaturas.find((m) => m.id === a.asignaturaId);
            return mat && mat.nombre.toLowerCase().includes(q);
          });

          if (!nameMatch && !cedulaMatch && !specMatch && !emailMatch && !subjectMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filtros.ordenarPor === 'calificacion_desc') {
          const avgA = (a.calificacionAlumnos + a.calificacionCoordinacion) / 2;
          const avgB = (b.calificacionAlumnos + b.calificacionCoordinacion) / 2;
          return avgB - avgA;
        }
        if (filtros.ordenarPor === 'calificacion_asc') {
          const avgA = (a.calificacionAlumnos + a.calificacionCoordinacion) / 2;
          const avgB = (b.calificacionAlumnos + b.calificacionCoordinacion) / 2;
          return avgA - avgB;
        }
        if (filtros.ordenarPor === 'antiguedad_desc') {
          const antA = calcularAntiguedad(a.fechaIngreso).totalMeses;
          const antB = calcularAntiguedad(b.fechaIngreso).totalMeses;
          return antB - antA;
        }
        if (filtros.ordenarPor === 'nombre_asc') {
          return a.nombre.localeCompare(b.nombre);
        }
        return 0;
      });
  }, [db, filtros]);

  // Handlers for database operations
  const handleSaveAssignment = (asignacionData: Omit<AsignacionDocente, 'id'>) => {
    const { state } = StorageService.assignProfesor(asignacionData);
    setDb({ ...state });
    showToast('Asignación docente guardada correctamente.');
  };

  const handleCreateProfesor = (profesorData: Omit<Profesor, 'id'>) => {
    const { state, nuevo } = StorageService.addProfesor(profesorData);
    setDb({ ...state });
    showToast(`Docente ${nuevo.nombre} registrado con éxito.`);
  };

  const handleCreateLicenciatura = (
    licData: Omit<Licenciatura, 'id'>,
    options?: { autoGenerarGrupos?: boolean; abrirPlanCurricular?: boolean }
  ) => {
    const { state, nueva } = StorageService.addLicenciatura(licData);
    let finalState = state;

    if (options?.autoGenerarGrupos) {
      finalState = StorageService.generateGroupsForLicenciatura(nueva.id);
    }

    setDb({ ...finalState });
    showToast(`Licenciatura ${nueva.nombre} dada de alta con éxito.`);

    if (options?.abrirPlanCurricular) {
      setCurriculumPlanLicenciatura(nueva);
    }
  };

  const handleUpdateLicenciatura = (id: string, updates: Partial<Licenciatura>) => {
    const updatedState = StorageService.updateLicenciatura(id, updates);
    setDb({ ...updatedState });
    setEditingLicenciatura(null);
    showToast(`Carrera ${updates.nombre || ''} actualizada con éxito.`);
  };

  const handleUpdateEvaluation = (profesorId: string, updates: Partial<Profesor>) => {
    const updatedState = StorageService.updateProfesor(profesorId, updates);
    setDb({ ...updatedState });
    showToast('Calificaciones y rubros actualizados.');
  };

  const handleAddAsignatura = (
    asigData: Omit<Asignatura, 'id'>,
    asignacionInfo?: { profesorId: string; horario?: string; grupoId?: string }
  ) => {
    const { state, nueva, asignacion } = StorageService.addAsignaturaWithAssignment(
      asigData,
      asignacionInfo
    );
    setDb({ ...state });
    if (asignacion) {
      showToast(`Asignatura ${nueva.nombre} creada y profesor asignado correctamente.`);
    } else {
      showToast(`Asignatura ${nueva.nombre} añadida a la malla.`);
    }
  };

  const handleGenerateGroups = (licenciaturaId: string) => {
    const state = StorageService.generateGroupsForLicenciatura(licenciaturaId);
    setDb({ ...state });
    showToast('Grupos escolares generados para la carrera.');
  };

  const handleDeleteAsignacion = (asignacionId: string) => {
    const state = StorageService.deleteAsignacion(asignacionId);
    setDb({ ...state });
    showToast('Asignación docente retirada.');
  };

  const handleAddGrupo = (grupoData: Omit<Grupo, 'id'>) => {
    const { state, nuevo } = StorageService.addGrupo(grupoData);
    setDb({ ...state });
    showToast(`Grupo ${nuevo.codigo} creado en la base de datos.`);
  };

  // RESTRICTED DELETION: Only Administrator (URIEL) can delete!
  const handleConfirmDelete = (tipo: DeleteItemTarget['tipo'], id: string) => {
    if (!currentUser || currentUser.rol !== 'administrador') {
      showToast('Acceso denegado: Solo el administrador URIEL puede dar de baja registros.');
      return;
    }

    let updatedState: DatabaseState;
    if (tipo === 'maestro') {
      updatedState = StorageService.deleteProfesor(id);
      showToast('Docente dado de baja exitosamente del sistema.');
    } else if (tipo === 'licenciatura') {
      updatedState = StorageService.deleteLicenciatura(id);
      showToast('Licenciatura y materias asociadas dadas de baja.');
    } else {
      updatedState = StorageService.deleteAsignatura(id);
      showToast('Asignatura eliminada de la malla curricular.');
    }

    setDb({ ...updatedState });
  };

  const handleAddUser = (userData: Omit<Usuario, 'id'>) => {
    const { state, nuevo } = StorageService.addUsuario(userData);
    setDb({ ...state });
    showToast(`Usuario ${nuevo.username} registrado correctamente.`);
  };

  const handleDeleteUser = (userId: string) => {
    if (!currentUser || currentUser.rol !== 'administrador') {
      showToast('Solo el administrador puede eliminar usuarios.');
      return;
    }
    const state = StorageService.deleteUsuario(userId);
    setDb({ ...state });
    showToast('Usuario eliminado del sistema.');
  };

  const handleSwitchUser = (user: Usuario) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`Sesión activa: ${user.nombre} (${user.rol.toUpperCase()})`);
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    showToast('Sesión cerrada. Ingrese con sus credenciales.');
  };

  const handleResetToSeed = () => {
    if (currentUser?.rol !== 'administrador') {
      showToast('Solo el administrador URIEL puede restaurar la base de datos.');
      return;
    }
    const seed = StorageService.resetToSeed();
    setDb({ ...seed });
    showToast('Base de datos restablecida a los valores iniciales.');
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siac_base_datos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Respaldo JSON descargado.');
  };

  const handleExportCSV = () => {
    const csvStr = StorageService.exportCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_docentes_siac_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Reporte CSV exportado exitosamente.');
  };

  const handleImportJSON = (jsonText: string) => {
    const res = StorageService.importJSON(jsonText);
    if (res.success && res.state) {
      setDb({ ...res.state });
      showToast('Base de datos importada satisfactoriamente.');
    } else {
      alert(`Error al importar: ${res.error || 'Archivo inválido'}`);
    }
  };

  // Solicitar inicio de sesión obligatorio si no hay usuario autenticado
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Bienvenido al sistema, ${user.nombre}`);
        }}
      />
    );
  }

  const totalResultados =
    activeTab === 'malla' ? gruposFiltrados.length : profesoresFiltrados.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar with User Session & Action Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserModalOpen(true)}
        onOpenNewLicenciatura={() => setIsNewLicOpen(true)}
        onOpenNewProfessor={() => setIsNewProfOpen(true)}
        onOpenDatabaseManager={() => setActiveTab('gestion')}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metric Summary Cards */}
        <MetricCards db={db} onNavigateToTab={setActiveTab} />

        {/* Cascading & Search Filter Bar (Visible in Malla & Directorio) */}
        {(activeTab === 'malla' || activeTab === 'directorio') && (
          <FilterBar
            filtros={filtros}
            setFiltros={setFiltros}
            db={db}
            totalResultados={totalResultados}
            onOpenEditLicenciatura={(lic) => setEditingLicenciatura(lic)}
          />
        )}

        {/* View 1: Malla Curricular y Asignación Docente por Grupos */}
        {activeTab === 'malla' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Asignaciones Académicas por Grupo Específico
                </h2>
                <p className="text-xs text-slate-500">
                  Despliegue de asignaturas, profesores asignados, antigüedad y calificaciones por grupo escolar.
                </p>
              </div>
            </div>

            <AcademicGrid
              db={db}
              gruposFiltrados={gruposFiltrados}
              currentUser={currentUser}
              selectedLicenciaturaId={filtros.licenciaturaId}
              onSelectProfesor={(prof) => setSelectedProfesor(prof)}
              onOpenAssignModal={(params) => setAssignModalParams(params)}
              onRequestDelete={(target) => setDeleteTarget(target)}
              onOpenEditLicenciatura={(lic) => setEditingLicenciatura(lic)}
              onOpenCurriculumPlan={(lic) => setCurriculumPlanLicenciatura(lic)}
              onGenerateGroups={handleGenerateGroups}
            />
          </div>
        )}

        {/* View 2: Directorio de Profesores */}
        {activeTab === 'directorio' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Directorio y Catálogo Docente
                </h2>
                <p className="text-xs text-slate-500">
                  Registro de antigüedad en años/meses y calificaciones otorgadas por alumnos y coordinación académica.
                </p>
              </div>
            </div>

            <ProfessorsDirectory
              profesores={profesoresFiltrados}
              db={db}
              currentUser={currentUser}
              onSelectProfesor={(prof) => setSelectedProfesor(prof)}
              onEvaluateProfesor={(prof) => setEvaluateProfesor(prof)}
              onRequestDelete={(target) => setDeleteTarget(target)}
            />
          </div>
        )}

        {/* View 3: Analítica y Reportes Ejecutivos */}
        {activeTab === 'analitica' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Tablero de Control y Analítica Docente
              </h2>
              <p className="text-xs text-slate-500">
                Auditoría cruzada de desempeño docente, decanato institucional y cobertura por modalidad académica.
              </p>
            </div>

            <AnalyticsView
              db={db}
              onSelectProfesor={(prof) => setSelectedProfesor(prof)}
            />
          </div>
        )}

        {/* View 4: Gestión de Base de Datos */}
        {activeTab === 'gestion' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Administración y Respaldo de la Base de Datos
              </h2>
              <p className="text-xs text-slate-500">
                Catálogos completos, altas de carreras y materias, y bajas autorizadas exclusivamente para el administrador URIEL.
              </p>
            </div>

            <DatabaseManagerView
              db={db}
              currentUser={currentUser}
              onExportJSON={handleExportJSON}
              onExportCSV={handleExportCSV}
              onImportJSON={handleImportJSON}
              onResetSeed={handleResetToSeed}
              onAddAsignatura={handleAddAsignatura}
              onAddGrupo={handleAddGrupo}
              onOpenNewLicenciatura={() => setIsNewLicOpen(true)}
              onOpenEditLicenciatura={(lic) => setEditingLicenciatura(lic)}
              onOpenCurriculumPlan={(lic) => setCurriculumPlanLicenciatura(lic)}
              onOpenAssignModal={(params) => setAssignModalParams(params)}
              onRequestDelete={(target) => setDeleteTarget(target)}
            />
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ProfessorModal
        profesor={selectedProfesor}
        onClose={() => setSelectedProfesor(null)}
        db={db}
        currentUser={currentUser}
        onEditEvaluation={(prof) => {
          setSelectedProfesor(null);
          setEvaluateProfesor(prof);
        }}
        onRequestDelete={(target) => setDeleteTarget(target)}
      />

      <AssignProfessorModal
        params={assignModalParams}
        onClose={() => setAssignModalParams(null)}
        db={db}
        onSaveAssignment={handleSaveAssignment}
      />

      <NewProfessorModal
        isOpen={isNewProfOpen}
        onClose={() => setIsNewProfOpen(false)}
        onSave={handleCreateProfesor}
      />

      <NewLicenciaturaModal
        isOpen={isNewLicOpen}
        onClose={() => setIsNewLicOpen(false)}
        onSave={handleCreateLicenciatura}
      />

      <EditLicenciaturaModal
        licenciatura={editingLicenciatura}
        isOpen={!!editingLicenciatura}
        onClose={() => setEditingLicenciatura(null)}
        onSave={handleUpdateLicenciatura}
        onOpenCurriculumPlan={(lic) => setCurriculumPlanLicenciatura(lic)}
      />

      <CurriculumPlanModal
        isOpen={!!curriculumPlanLicenciatura}
        licenciatura={curriculumPlanLicenciatura}
        db={db}
        currentUser={currentUser}
        onClose={() => setCurriculumPlanLicenciatura(null)}
        onAddAsignatura={handleAddAsignatura}
        onDeleteAsignatura={(asigId) => {
          const asig = db.asignaturas.find((a) => a.id === asigId);
          if (asig) {
            setDeleteTarget({
              tipo: 'asignatura',
              id: asig.id,
              nombre: `${asig.clave} · ${asig.nombre}`,
            });
          }
        }}
        onOpenAssignModal={(params) => setAssignModalParams(params)}
        onGenerateGroups={handleGenerateGroups}
        onDeleteAsignacion={handleDeleteAsignacion}
      />

      <EvaluateProfessorModal
        profesor={evaluateProfesor}
        onClose={() => setEvaluateProfesor(null)}
        onSave={handleUpdateEvaluation}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        db={db}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onLogout={handleLogout}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserModalOpen(true)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SIAC · Sistema Integral de Asignación y Evaluación Docente
          </span>
          <span className="font-mono text-slate-400">
            Usuario activo: {currentUser.username} ({currentUser.rol}) · Última sincronización: {new Date(db.lastUpdated).toLocaleDateString('es-MX')}
          </span>
        </div>
      </footer>
    </div>
  );
}
