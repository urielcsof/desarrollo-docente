export type ModalidadId = 'escolarizado' | 'ejecutivo' | 'a_distancia';

export interface ModalidadInfo {
  id: ModalidadId;
  nombre: string;
  descripcion: string;
  horarioTipo: string;
  badgeColor: string;
}

export interface Licenciatura {
  id: string;
  codigo: string;
  nombre: string;
  area: string;
  totalCuatrimestres: number;
  modalidadesDisponibles: ModalidadId[];
  rvoe: string;
  directorCarrera: string;
}

export interface DetalleEvaluacionAlumnos {
  dominioTema: number; // 0 - 10
  claridadExposicion: number;
  puntualidadAsistencia: number;
  retroalimentacion: number;
  empatiaYRespeto: number;
}

export interface DetalleEvaluacionCoordinacion {
  entregaPlaneaciones: number; // 0 - 10
  asistenciaClaustros: number;
  avanceProgramatico: number;
  subidaCalificacionesTiempo: number;
  innovacionDidactica: number;
}

export interface Profesor {
  id: string;
  nombre: string;
  gradoAcademico: 'Lic.' | 'Ing.' | 'Mtro.' | 'Mtra.' | 'Dr.' | 'Dra.';
  correo: string;
  telefono: string;
  cedula: string;
  fechaIngreso: string; // YYYY-MM-DD
  calificacionAlumnos: number; // 0.0 - 10.0
  totalEvaluadosAlumnos: number;
  detallesAlumnos: DetalleEvaluacionAlumnos;
  calificacionCoordinacion: number; // 0.0 - 10.0
  detallesCoordinacion: DetalleEvaluacionCoordinacion;
  especialidad: string;
  estado: 'activo' | 'sabático' | 'en_capacitacion';
  observacionesCoordinacion?: string;
}

export interface Asignatura {
  id: string;
  licenciaturaId: string;
  cuatrimestre: number;
  clave: string;
  nombre: string;
  creditos: number;
  horasSemanales: number;
  areaCurricular: string;
}

export interface Grupo {
  id: string;
  codigo: string;
  licenciaturaId: string;
  modalidad: ModalidadId;
  cuatrimestre: number;
  turno: 'Matutino' | 'Vespertino' | 'Sabatino' | 'Virtual / Asíncrono';
  cicloEscolar: string;
  aula: string;
  cupoAlumnos: number;
}

export interface AsignacionDocente {
  id: string;
  profesorId: string;
  asignaturaId: string;
  grupoId: string;
  licenciaturaId: string;
  modalidad: ModalidadId;
  cuatrimestre: number;
  horario: string;
  estado: 'confirmada' | 'propuesta' | 'suplencia';
}

export interface FiltrosBusqueda {
  licenciaturaId: string; // 'todas' or specific
  modalidad: ModalidadId | 'todas';
  cuatrimestre: number | 'todos';
  grupoId: string; // 'todos' or specific
  busquedaTexto: string;
  rangoAntiguedad: 'todas' | 'menos_1' | '1_3' | '3_6' | 'mas_6';
  rangoCalificacion: 'todas' | 'sobresaliente' | 'bueno' | 'regular' | 'alerta' | 'debajo_9' | 'foco_rojo';
  ordenarPor: 'calificacion_desc' | 'calificacion_asc' | 'antiguedad_desc' | 'nombre_asc';
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  password?: string;
  rol: 'administrador' | 'coordinador';
  correo: string;
}

export interface DatabaseState {
  usuarios: Usuario[];
  licenciaturas: Licenciatura[];
  profesores: Profesor[];
  asignaturas: Asignatura[];
  grupos: Grupo[];
  asignaciones: AsignacionDocente[];
  lastUpdated: string;
}
