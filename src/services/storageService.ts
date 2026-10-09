import { INITIAL_DATABASE } from '../data/seedData';
import { 
  AsignacionDocente, 
  Asignatura, 
  DatabaseState, 
  Grupo, 
  Licenciatura, 
  ModalidadId,
  Profesor, 
  Usuario 
} from '../types/database';
import { calcularAntiguedad } from '../utils/academicHelpers';

const STORAGE_KEY = 'siac_academic_database_v1';
const CURRENT_USER_KEY = 'siac_current_user_v1';

export class StorageService {
  public static getDatabase(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveDatabase(INITIAL_DATABASE);
        return INITIAL_DATABASE;
      }
      const parsed: DatabaseState = JSON.parse(stored);
      if (!parsed.licenciaturas || !parsed.profesores || !parsed.asignaciones) {
        this.saveDatabase(INITIAL_DATABASE);
        return INITIAL_DATABASE;
      }

      // Ensure default users exist (including URIEL / UCHAVEZ)
      if (!parsed.usuarios || parsed.usuarios.length === 0) {
        parsed.usuarios = INITIAL_DATABASE.usuarios;
        this.saveDatabase(parsed);
      } else {
        // Ensure URIEL admin user is guaranteed
        const hasUriel = parsed.usuarios.some(
          (u) => u.username.toUpperCase() === 'URIEL'
        );
        if (!hasUriel) {
          parsed.usuarios.push({
            id: 'usr-admin-01',
            username: 'URIEL',
            nombre: 'Uriel Chávez (Super Administrador)',
            password: 'UCHAVEZ',
            rol: 'administrador',
            correo: 'uriel@universidad.edu.mx',
          });
          this.saveDatabase(parsed);
        }
      }

      // Ensure Foco Rojo seed professors prof-19 & prof-20 exist
      const hasProf19 = parsed.profesores.some((p) => p.id === 'prof-19');
      if (!hasProf19) {
        const p19 = INITIAL_DATABASE.profesores.find((p) => p.id === 'prof-19');
        const p20 = INITIAL_DATABASE.profesores.find((p) => p.id === 'prof-20');
        if (p19) parsed.profesores.push(p19);
        if (p20) parsed.profesores.push(p20);
        this.saveDatabase(parsed);
      }

      return parsed;
    } catch {
      return INITIAL_DATABASE;
    }
  }

  public static saveDatabase(state: DatabaseState): void {
    try {
      const toSave = {
        ...state,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Error al guardar en almacenamiento local:', e);
    }
  }

  public static resetToSeed(): DatabaseState {
    this.saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  // --- GESTIÓN DE SESIÓN Y USUARIOS ---
  public static getSessionUser(): Usuario | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed: Usuario = JSON.parse(stored);
        if (parsed.username && parsed.rol) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  }

  public static setCurrentUser(user: Usuario): void {
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error al guardar usuario actual:', e);
    }
  }

  public static logout(): void {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  }

  public static login(usernameInput: string, passwordInput: string): { success: boolean; user?: Usuario; error?: string } {
    const db = this.getDatabase();
    const user = db.usuarios.find(
      (u) =>
        u.username.toUpperCase() === usernameInput.trim().toUpperCase() &&
        u.password === passwordInput.trim()
    );

    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos. Verifica tus credenciales.' };
  }

  public static addUsuario(userData: Omit<Usuario, 'id'>): { state: DatabaseState; nuevo: Usuario } {
    const current = this.getDatabase();
    const id = `usr-${Date.now().toString(36)}`;
    const nuevo: Usuario = { ...userData, id };
    current.usuarios.push(nuevo);
    this.saveDatabase(current);
    return { state: current, nuevo };
  }

  public static deleteUsuario(id: string): DatabaseState {
    const current = this.getDatabase();
    current.usuarios = current.usuarios.filter((u) => u.id !== id);
    this.saveDatabase(current);
    return current;
  }

  // --- LICENCIATURAS / CARRERAS ---
  public static addLicenciatura(licData: Omit<Licenciatura, 'id'>): { state: DatabaseState; nueva: Licenciatura } {
    const current = this.getDatabase();
    const id = `lic-${licData.codigo.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const nueva: Licenciatura = { ...licData, id };
    current.licenciaturas.push(nueva);
    this.saveDatabase(current);
    return { state: current, nueva };
  }

  public static updateLicenciatura(id: string, updates: Partial<Licenciatura>): DatabaseState {
    const current = this.getDatabase();
    const index = current.licenciaturas.findIndex((l) => l.id === id);
    if (index !== -1) {
      current.licenciaturas[index] = { ...current.licenciaturas[index], ...updates };
      this.saveDatabase(current);
    }
    return current;
  }

  public static deleteLicenciatura(id: string): DatabaseState {
    const current = this.getDatabase();
    // Baja de licenciatura y cascada de limpieza
    current.licenciaturas = current.licenciaturas.filter((l) => l.id !== id);
    current.asignaturas = current.asignaturas.filter((a) => a.licenciaturaId !== id);
    current.grupos = current.grupos.filter((g) => g.licenciaturaId !== id);
    current.asignaciones = current.asignaciones.filter((asig) => asig.licenciaturaId !== id);
    this.saveDatabase(current);
    return current;
  }

  // --- PROFESORES / MAESTROS ---
  public static addProfesor(profesorData: Omit<Profesor, 'id'>): { state: DatabaseState; nuevo: Profesor } {
    const current = this.getDatabase();
    const id = `prof-${Date.now().toString(36)}`;
    const nuevo: Profesor = { ...profesorData, id };
    current.profesores.push(nuevo);
    this.saveDatabase(current);
    return { state: current, nuevo };
  }

  public static updateProfesor(id: string, updates: Partial<Profesor>): DatabaseState {
    const current = this.getDatabase();
    const index = current.profesores.findIndex((p) => p.id === id);
    if (index !== -1) {
      current.profesores[index] = { ...current.profesores[index], ...updates };
      this.saveDatabase(current);
    }
    return current;
  }

  public static deleteProfesor(id: string): DatabaseState {
    const current = this.getDatabase();
    current.profesores = current.profesores.filter((p) => p.id !== id);
    current.asignaciones = current.asignaciones.filter((a) => a.profesorId !== id);
    this.saveDatabase(current);
    return current;
  }

  // --- ASIGNATURAS / MATERIAS ---
  public static addAsignatura(asigData: Omit<Asignatura, 'id'>): { state: DatabaseState; nueva: Asignatura } {
    const current = this.getDatabase();
    const id = `asig-${asigData.clave.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const nueva: Asignatura = { ...asigData, id };
    current.asignaturas.push(nueva);
    this.saveDatabase(current);
    return { state: current, nueva };
  }

  public static addAsignaturaWithAssignment(
    asigData: Omit<Asignatura, 'id'>,
    asignacionInfo?: {
      profesorId: string;
      horario?: string;
      grupoId?: string;
      modalidad?: ModalidadId;
    }
  ): { state: DatabaseState; nueva: Asignatura; asignacion?: AsignacionDocente } {
    const current = this.getDatabase();
    const id = `asig-${asigData.clave.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const nueva: Asignatura = { ...asigData, id };
    current.asignaturas.push(nueva);

    let asignacionFinal: AsignacionDocente | undefined;

    if (asignacionInfo && asignacionInfo.profesorId) {
      // Find or create group for this licenciatura and cuatrimestre
      let targetGrupo = current.grupos.find(
        (g) => g.id === asignacionInfo.grupoId
      );

      if (!targetGrupo) {
        // Try finding by licenciaturaId and cuatrimestre
        targetGrupo = current.grupos.find(
          (g) =>
            g.licenciaturaId === asigData.licenciaturaId &&
            g.cuatrimestre === asigData.cuatrimestre
        );
      }

      if (!targetGrupo) {
        // Create a default group
        const lic = current.licenciaturas.find((l) => l.id === asigData.licenciaturaId);
        const licCode = lic ? lic.codigo : 'LIC';
        const mod = asignacionInfo.modalidad || (lic?.modalidadesDisponibles[0] ?? 'escolarizado');
        const grpId = `grp-${licCode.toLowerCase()}-${asigData.cuatrimestre}01-${Date.now().toString(36)}`;
        targetGrupo = {
          id: grpId,
          codigo: `${licCode}-${asigData.cuatrimestre}01`,
          licenciaturaId: asigData.licenciaturaId,
          modalidad: mod,
          cuatrimestre: asigData.cuatrimestre,
          turno: mod === 'ejecutivo' ? 'Sabatino' : 'Matutino',
          cicloEscolar: '2026-C3',
          aula: `Edificio A Aula ${asigData.cuatrimestre}01`,
          cupoAlumnos: 30,
        };
        current.grupos.push(targetGrupo);
      }

      const defaultHorario =
        targetGrupo.modalidad === 'ejecutivo'
          ? 'Sábados 08:00 - 11:30 hrs'
          : targetGrupo.modalidad === 'a_distancia'
          ? 'Martes y Jueves 19:00 - 21:00 hrs (Virtual)'
          : 'Lun y Mié 08:00 - 10:00 hrs';

      const asigId = `asig-doc-${Date.now().toString(36)}`;
      asignacionFinal = {
        id: asigId,
        profesorId: asignacionInfo.profesorId,
        asignaturaId: nueva.id,
        grupoId: targetGrupo.id,
        licenciaturaId: asigData.licenciaturaId,
        modalidad: targetGrupo.modalidad,
        cuatrimestre: asigData.cuatrimestre,
        horario: asignacionInfo.horario?.trim() || defaultHorario,
        estado: 'confirmada',
      };
      current.asignaciones.push(asignacionFinal);
    }

    this.saveDatabase(current);
    return { state: current, nueva, asignacion: asignacionFinal };
  }

  public static generateGroupsForLicenciatura(
    licenciaturaId: string,
    cuatrimestres?: number[]
  ): DatabaseState {
    const current = this.getDatabase();
    const lic = current.licenciaturas.find((l) => l.id === licenciaturaId);
    if (!lic) return current;

    const cuatsToCreate =
      cuatrimestres && cuatrimestres.length > 0
        ? cuatrimestres
        : Array.from({ length: lic.totalCuatrimestres }, (_, i) => i + 1);

    cuatsToCreate.forEach((c) => {
      // Check if a group already exists for this cuatrimestre
      const existing = current.grupos.some(
        (g) => g.licenciaturaId === licenciaturaId && g.cuatrimestre === c
      );

      if (!existing) {
        const mod = lic.modalidadesDisponibles[0] || 'escolarizado';
        current.grupos.push({
          id: `grp-${lic.codigo.toLowerCase()}-${c}01-${Date.now().toString(36)}`,
          codigo: `${lic.codigo}-${c}01`,
          licenciaturaId: lic.id,
          modalidad: mod,
          cuatrimestre: c,
          turno: mod === 'ejecutivo' ? 'Sabatino' : 'Matutino',
          cicloEscolar: '2026-C3',
          aula: `Aula ${c}01`,
          cupoAlumnos: 30,
        });
      }
    });

    this.saveDatabase(current);
    return current;
  }

  public static deleteAsignatura(id: string): DatabaseState {
    const current = this.getDatabase();
    current.asignaturas = current.asignaturas.filter((a) => a.id !== id);
    current.asignaciones = current.asignaciones.filter((asig) => asig.asignaturaId !== id);
    this.saveDatabase(current);
    return current;
  }

  // --- GRUPOS ---
  public static addGrupo(grupoData: Omit<Grupo, 'id'>): { state: DatabaseState; nuevo: Grupo } {
    const current = this.getDatabase();
    const id = `grp-${grupoData.codigo.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const nuevo: Grupo = { ...grupoData, id };
    current.grupos.push(nuevo);
    this.saveDatabase(current);
    return { state: current, nuevo };
  }

  public static deleteGrupo(id: string): DatabaseState {
    const current = this.getDatabase();
    current.grupos = current.grupos.filter((g) => g.id !== id);
    current.asignaciones = current.asignaciones.filter((asig) => asig.grupoId !== id);
    this.saveDatabase(current);
    return current;
  }

  // --- ASIGNACIONES DOCENTES ---
  public static assignProfesor(asignacionData: Omit<AsignacionDocente, 'id'>): { state: DatabaseState; nueva: AsignacionDocente } {
    const current = this.getDatabase();
    // Verificar si ya existe una asignación para esta asignatura y grupo
    const existingIndex = current.asignaciones.findIndex(
      (a) => a.asignaturaId === asignacionData.asignaturaId && a.grupoId === asignacionData.grupoId
    );

    let asignacionFinal: AsignacionDocente;
    if (existingIndex !== -1) {
      current.asignaciones[existingIndex] = {
        ...current.asignaciones[existingIndex],
        ...asignacionData,
      };
      asignacionFinal = current.asignaciones[existingIndex];
    } else {
      const id = `asig-doc-${Date.now().toString(36)}`;
      asignacionFinal = { ...asignacionData, id };
      current.asignaciones.push(asignacionFinal);
    }

    this.saveDatabase(current);
    return { state: current, nueva: asignacionFinal };
  }

  public static deleteAsignacion(id: string): DatabaseState {
    const current = this.getDatabase();
    current.asignaciones = current.asignaciones.filter((a) => a.id !== id);
    this.saveDatabase(current);
    return current;
  }

  // --- IMPORTACIÓN Y EXPORTACIÓN ---
  public static exportJSON(): string {
    const db = this.getDatabase();
    return JSON.stringify(db, null, 2);
  }

  public static importJSON(jsonText: string): { success: boolean; error?: string; state?: DatabaseState } {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.licenciaturas || !parsed.profesores || !parsed.asignaturas) {
        return { success: false, error: 'El archivo JSON no contiene la estructura requerida.' };
      }
      this.saveDatabase(parsed);
      return { success: true, state: parsed };
    } catch {
      return { success: false, error: 'Formato de archivo inválido.' };
    }
  }

  public static exportCSV(): string {
    const db = this.getDatabase();
    const rows = [
      [
        'ID_Profesor',
        'Nombre_Docente',
        'Grado',
        'Cedula',
        'Correo',
        'Fecha_Ingreso',
        'Antiguedad',
        'Calificacion_Alumnos',
        'Total_Alumnos_Evaluados',
        'Calificacion_Coordinacion',
        'Promedio_Global',
        'Especialidad',
        'Estado',
        'Total_Materias_Asignadas',
      ],
    ];

    db.profesores.forEach((prof) => {
      const antiguedad = calcularAntiguedad(prof.fechaIngreso);
      const materiasAsignadas = db.asignaciones.filter((a) => a.profesorId === prof.id).length;
      const promedio = ((prof.calificacionAlumnos + prof.calificacionCoordinacion) / 2).toFixed(2);
      
      rows.push([
        prof.id,
        `"${prof.nombre.replace(/"/g, '""')}"`,
        prof.gradoAcademico,
        prof.cedula,
        prof.correo,
        prof.fechaIngreso,
        `"${antiguedad.texto}"`,
        prof.calificacionAlumnos.toFixed(1),
        prof.totalEvaluadosAlumnos.toString(),
        prof.calificacionCoordinacion.toFixed(1),
        promedio,
        `"${prof.especialidad.replace(/"/g, '""')}"`,
        prof.estado,
        materiasAsignadas.toString(),
      ]);
    });

    return '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
  }
}
