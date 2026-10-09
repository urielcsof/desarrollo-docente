import { ModalidadId, ModalidadInfo } from '../types/database';

export const MODALIDADES_CATALOGO: Record<ModalidadId, ModalidadInfo> = {
  escolarizado: {
    id: 'escolarizado',
    nombre: 'Escolarizado',
    descripcion: 'Presencial de lunes a viernes en campus central con asistencia regular obligatoria.',
    horarioTipo: 'Lunes a Viernes 07:00 - 13:00 / 16:00 - 21:00 hrs',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ejecutivo: {
    id: 'ejecutivo',
    nombre: 'Ejecutivo',
    descripcion: 'Modalidad híbrida/sabatina diseñada para personas que trabajan, con clases concentradas.',
    horarioTipo: 'Sábados intensivos 08:00 - 15:00 hrs + soporte digital',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  a_distancia: {
    id: 'a_distancia',
    nombre: 'A Distancia',
    descripcion: '100% online y asíncrono en Campus Virtual con tutorías síncronas programadas.',
    horarioTipo: 'Campus Virtual 24/7 con sesiones sincrónicas semanales',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

export interface AntiguedadResult {
  anios: number;
  meses: number;
  dias: number;
  totalMeses: number;
  texto: string;
  textoCorto: string;
}

export function calcularAntiguedad(fechaIngresoStr: string, fechaReferencia: Date = new Date()): AntiguedadResult {
  const fechaIngreso = new Date(fechaIngresoStr);
  if (isNaN(fechaIngreso.getTime())) {
    return { anios: 0, meses: 0, dias: 0, totalMeses: 0, texto: 'Sin registro', textoCorto: '0a' };
  }

  let anios = fechaReferencia.getFullYear() - fechaIngreso.getFullYear();
  let meses = fechaReferencia.getMonth() - fechaIngreso.getMonth();
  let dias = fechaReferencia.getDate() - fechaIngreso.getDate();

  if (dias < 0) {
    meses--;
    // aproximado días mes previo
    dias += 30;
  }
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  if (anios < 0) {
    anios = 0;
    meses = 0;
  }

  const totalMeses = anios * 12 + meses;

  let texto = '';
  if (anios === 0) {
    texto = `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  } else if (meses === 0) {
    texto = `${anios} ${anios === 1 ? 'año' : 'años'}`;
  } else {
    texto = `${anios} ${anios === 1 ? 'año' : 'años'}, ${meses} ${meses === 1 ? 'm' : 'meses'}`;
  }

  const textoCorto = anios > 0 ? `${anios}a ${meses}m` : `${meses}m`;

  return { anios, meses, dias, totalMeses, texto, textoCorto };
}

export interface CategoriaDesempeno {
  promedio: number;
  nivel: 'Excelente' | 'Aceptable' | 'Requiere Capacitación' | 'Foco Rojo';
  colorClase: string;
  badgeBg: string;
  textoColor: string;
}

export function obtenerCategoriaDesempeno(califAlumnos: number, califCoordinacion: number): CategoriaDesempeno {
  const promedio = Number(((califAlumnos + califCoordinacion) / 2).toFixed(2));
  
  if (promedio <= 7.0) {
    return {
      promedio,
      nivel: 'Foco Rojo',
      colorClase: 'text-rose-800 bg-rose-100 border-rose-300 font-bold',
      badgeBg: 'bg-rose-100',
      textoColor: 'text-rose-800',
    };
  }
  if (promedio < 9.0) {
    return {
      promedio,
      nivel: 'Requiere Capacitación',
      colorClase: 'text-amber-800 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-50',
      textoColor: 'text-amber-800',
    };
  }
  if (promedio >= 9.5) {
    return {
      promedio,
      nivel: 'Excelente',
      colorClase: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-50',
      textoColor: 'text-emerald-700',
    };
  }
  return {
    promedio,
    nivel: 'Aceptable',
    colorClase: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-50',
    textoColor: 'text-blue-700',
  };
}

export function formatearCalificacion(valor: number): string {
  return Number(valor).toFixed(1);
}

export interface DiagnosticoCapacitacion {
  areaDebil: string;
  moduloRecomendado: string;
  codigoModulo: string;
  prioridad: 'Urgente (Foco Rojo)' | 'Refuerzo Pedagógico' | 'Seguimiento Regular';
  accionSugerida: string;
}

export function obtenerDiagnosticoYCapacitacion(
  califAlumnos: number,
  califCoordinacion: number,
  detallesAlumnos?: {
    dominioTema: number;
    claridadExposicion: number;
    puntualidadAsistencia: number;
    retroalimentacion: number;
    empatiaYRespeto: number;
  },
  detallesCoordinacion?: {
    entregaPlaneaciones: number;
    asistenciaClaustros: number;
    avanceProgramatico: number;
    subidaCalificacionesTiempo: number;
    innovacionDidactica: number;
  }
): DiagnosticoCapacitacion {
  const promedio = (califAlumnos + califCoordinacion) / 2;
  const esFocoRojo = promedio <= 7.0 || califAlumnos <= 7.0 || califCoordinacion <= 7.0;

  if (esFocoRojo) {
    // Diagnóstico específico para foco rojo
    if (califCoordinacion <= 7.0 && detallesCoordinacion && detallesCoordinacion.subidaCalificacionesTiempo <= 7.0) {
      return {
        areaDebil: 'Incumplimiento normativo severo en entrega de actas y planeaciones',
        moduloRecomendado: 'Taller Intensivo de Gestión Normativa, Control Escolar y Responsabilidad Docente',
        codigoModulo: 'CAP-URG-01',
        prioridad: 'Urgente (Foco Rojo)',
        accionSugerida: 'Citatorio formal con Coordinación Académica y supervisión de cátedra semanal.',
      };
    }
    return {
      areaDebil: 'Calificación deficiente en aula, quejas estudiantiles y ausencias a claustros',
      moduloRecomendado: 'Intervención Pedagógica de Emergencia: Manejo Grupal y Asistencia Docente',
      codigoModulo: 'CAP-URG-02',
      prioridad: 'Urgente (Foco Rojo)',
      accionSugerida: 'Emisión de apercibimiento institucional y plan de contingencia pedagógica.',
    };
  }

  if (promedio < 9.0) {
    // Si la calificación más baja viene de los alumnos
    if (califAlumnos < califCoordinacion) {
      if (detallesAlumnos && detallesAlumnos.claridadExposicion < 9.0) {
        return {
          areaDebil: 'Claridad en la exposición y dinámicas de enseñanza en el aula',
          moduloRecomendado: 'Estrategias de Microenseñanza y Comunicación Efectiva en el Aula Universitaria',
          codigoModulo: 'CAP-PED-101',
          prioridad: 'Refuerzo Pedagógico',
          accionSugerida: 'Inscripción obligatoria al taller intersemestral de didáctica universitaria.',
        };
      }
      return {
        areaDebil: 'Diseño de instrumentos de retroalimentación y empatía pedagógica',
        moduloRecomendado: 'Diseño de Rúbricas de Evaluación Formativa y Retroalimentación Constructiva',
        codigoModulo: 'CAP-PED-102',
        prioridad: 'Refuerzo Pedagógico',
        accionSugerida: 'Taller de acompañamiento y revisión de rúbricas con coordinación.',
      };
    } else {
      // Si la calificación más baja viene de coordinación
      if (detallesCoordinacion && detallesCoordinacion.entregaPlaneaciones < 9.0) {
        return {
          areaDebil: 'Planeaciones didácticas curriculares y avance programático',
          moduloRecomendado: 'Metodología para la Elaboración de Secuencias Didácticas y Avance por Competencias',
          codigoModulo: 'CAP-ADM-201',
          prioridad: 'Refuerzo Pedagógico',
          accionSugerida: 'Asesoría técnica con el área de diseño curricular antes del inicio de ciclo.',
        };
      }
      return {
        areaDebil: 'Puntualidad en subida de calificaciones y asistencia a reuniones colegiadas',
        moduloRecomendado: 'Optimización de Procesos de Evaluación y Buenas Prácticas en Claustros',
        codigoModulo: 'CAP-ADM-202',
        prioridad: 'Refuerzo Pedagógico',
        accionSugerida: 'Recordatorio calendarizado de entregables y seguimiento por jefatura.',
      };
    }
  }

  return {
    areaDebil: 'Desempeño satisfactorio dentro del estándar de excelencia',
    moduloRecomendado: 'Actualización en Innovación Educativa, Inteligencia Artificial y Docencia Superior',
    codigoModulo: 'ACT-OPT-301',
    prioridad: 'Seguimiento Regular',
    accionSugerida: 'Participación en congresos y diplomados de profundización académica.',
  };
}
