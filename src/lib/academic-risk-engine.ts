/**
 * academic-risk-engine.ts
 * Motor de cálculo determinista de riesgo académico.
 * No depende de ninguna IA externa — calcula en base a reglas fijas.
 */

// ──────────────────────────────────────────────
// Tipos de entrada
// ──────────────────────────────────────────────
export interface AttendanceRecord {
  status: 'presente' | 'ausente' | 'tarde' | 'justificado';
  date: string; // YYYY-MM-DD
  courseId: string;
}

export interface AssignmentSubmission {
  grade?: number; // 0–20
  assignmentId: string;
  submittedAt: string; // ISO string
  courseId?: string;
}

export interface QuizResult {
  score: number; // 0–20
  quizId: string;
  completionDate: string; // ISO string
  courseId: string;
}

// ──────────────────────────────────────────────
// Tipo de salida (idéntico al antiguo schema de IA)
// ──────────────────────────────────────────────
export interface RiskAnalysisOutput {
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  riskOfDropout: 'Muy bajo' | 'Bajo' | 'Moderado' | 'Alto' | 'Muy alto';
  summary: string;
  supportRecommendations: string[];
  alertLevel: 'Verde' | 'Amarillo' | 'Naranja' | 'Rojo';
  // Métricas calculadas para mostrar en la UI
  metrics: {
    attendanceRate: number;       // 0–100 (porcentaje)
    averageGrade: number | null;  // 0–20 o null si no hay datos
    quizAverage: number | null;   // 0–20 o null si no hay datos
    totalAbsences: number;
    totalRecords: number;
    gradeScore: number;           // 0–100 (puntuación parcial de notas)
    attendanceScore: number;      // 0–100 (puntuación parcial de asistencia)
    trendScore: number;           // 0–100 (puntuación parcial de tendencia)
    finalScore: number;           // 0–100 (puntuación compuesta final)
  };
}

// ──────────────────────────────────────────────
// Función principal
// ──────────────────────────────────────────────
export function calculateAcademicRisk(
  attendance: AttendanceRecord[],
  submissions: AssignmentSubmission[],
  quizzes: QuizResult[],
  studentName: string
): RiskAnalysisOutput {

  // ── 1. MÉTRICAS DE ASISTENCIA ──────────────────
  const totalRecords = attendance.length;
  const absences = attendance.filter(a => a.status === 'ausente').length;
  const lates = attendance.filter(a => a.status === 'tarde').length;
  const attendanceRate = totalRecords > 0
    ? ((totalRecords - absences) / totalRecords) * 100
    : 100; // sin datos → asumimos ok

  // ── 2. MÉTRICAS DE NOTAS ──────────────────────
  const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
  const averageGrade = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedSubmissions.length
    : null;

  const quizAverage = quizzes.length > 0
    ? quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
    : null;

  // Promedio combinado (tareas + exámenes)
  const gradeValues: number[] = [];
  if (averageGrade !== null) gradeValues.push(averageGrade);
  if (quizAverage !== null) gradeValues.push(quizAverage);
  const combinedGrade = gradeValues.length > 0
    ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length
    : null;

  // ── 3. SCORING PARCIAL ────────────────────────

  // Asistencia (35%)
  let attendanceScore: number;
  if (attendanceRate >= 85) attendanceScore = 100;
  else if (attendanceRate >= 70) attendanceScore = 65;
  else if (attendanceRate >= 60) attendanceScore = 35;
  else attendanceScore = 0;

  // Notas (40%)
  let gradeScore: number;
  if (combinedGrade === null) {
    gradeScore = 70; // sin datos → neutral
  } else if (combinedGrade >= 14) {
    gradeScore = 100;
  } else if (combinedGrade >= 11) {
    gradeScore = 60;
  } else if (combinedGrade >= 8) {
    gradeScore = 25;
  } else {
    gradeScore = 0;
  }

  // Tendencia reciente (25%)
  const trendScore = calculateTrendScore(attendance, submissions, quizzes);

  // Score final compuesto
  const finalScore = (attendanceScore * 0.35) + (gradeScore * 0.40) + (trendScore * 0.25);

  // ── 4. NIVEL DE RIESGO ────────────────────────
  let riskLevel: RiskAnalysisOutput['riskLevel'];
  let alertLevel: RiskAnalysisOutput['alertLevel'];
  let riskOfDropout: RiskAnalysisOutput['riskOfDropout'];

  if (finalScore >= 75) {
    riskLevel = 'Bajo';
    alertLevel = 'Verde';
    riskOfDropout = 'Muy bajo';
  } else if (finalScore >= 55) {
    riskLevel = 'Medio';
    alertLevel = 'Amarillo';
    riskOfDropout = finalScore >= 65 ? 'Bajo' : 'Moderado';
  } else if (finalScore >= 35) {
    riskLevel = 'Alto';
    alertLevel = 'Naranja';
    riskOfDropout = 'Alto';
  } else {
    riskLevel = 'Alto';
    alertLevel = 'Rojo';
    riskOfDropout = 'Muy alto';
  }

  // ── 5. RESUMEN EN TEXTO ───────────────────────
  const summary = buildSummary(
    studentName,
    attendanceRate,
    absences,
    lates,
    averageGrade,
    quizAverage,
    combinedGrade,
    totalRecords,
    submissions.length,
    quizzes.length,
    alertLevel
  );

  // ── 6. RECOMENDACIONES ────────────────────────
  const supportRecommendations = buildRecommendations(
    alertLevel,
    attendanceRate,
    combinedGrade,
    absences,
    trendScore
  );

  return {
    riskLevel,
    riskOfDropout,
    summary,
    supportRecommendations,
    alertLevel,
    metrics: {
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      averageGrade: averageGrade !== null ? parseFloat(averageGrade.toFixed(2)) : null,
      quizAverage: quizAverage !== null ? parseFloat(quizAverage.toFixed(2)) : null,
      totalAbsences: absences,
      totalRecords,
      gradeScore: parseFloat(gradeScore.toFixed(1)),
      attendanceScore: parseFloat(attendanceScore.toFixed(1)),
      trendScore: parseFloat(trendScore.toFixed(1)),
      finalScore: parseFloat(finalScore.toFixed(1)),
    }
  };
}

// ──────────────────────────────────────────────
// Cálculo de tendencia (últimas 2 semanas)
// ──────────────────────────────────────────────
function calculateTrendScore(
  attendance: AttendanceRecord[],
  submissions: AssignmentSubmission[],
  quizzes: QuizResult[]
): number {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let score = 80; // base neutral

  // Penalizar ausencias recientes
  const recentAbsences = attendance.filter(a => {
    const d = new Date(a.date);
    return a.status === 'ausente' && d >= fourteenDaysAgo;
  });
  if (recentAbsences.length >= 4) score -= 40;
  else if (recentAbsences.length >= 2) score -= 20;
  else if (recentAbsences.length >= 1) score -= 10;

  // Penalizar si hay ausencias consecutivas en los últimos 7 días
  const lastWeekAbsences = attendance.filter(a => {
    const d = new Date(a.date);
    return a.status === 'ausente' && d >= sevenDaysAgo;
  });
  if (lastWeekAbsences.length >= 3) score -= 25;

  // Penalizar tareas sin nota en las últimas 2 semanas
  const recentSubmissionsWithoutGrade = submissions.filter(s => {
    const d = new Date(s.submittedAt);
    return s.grade === undefined && d >= fourteenDaysAgo;
  });
  if (recentSubmissionsWithoutGrade.length > 0) score -= 10;

  // Bonus: exámenes recientes con buena nota
  const recentGoodQuizzes = quizzes.filter(q => {
    const d = new Date(q.completionDate);
    return q.score >= 13 && d >= fourteenDaysAgo;
  });
  if (recentGoodQuizzes.length > 0) score += 15;

  return Math.max(0, Math.min(100, score));
}

// ──────────────────────────────────────────────
// Generación de resumen textual
// ──────────────────────────────────────────────
function buildSummary(
  name: string,
  attendanceRate: number,
  absences: number,
  lates: number,
  avgGrade: number | null,
  quizAvg: number | null,
  combined: number | null,
  totalRecords: number,
  totalSubs: number,
  totalQuizzes: number,
  alertLevel: string
): string {
  const attStr = totalRecords > 0
    ? `una tasa de asistencia del ${attendanceRate.toFixed(1)}% (${absences} ausencia${absences !== 1 ? 's' : ''} y ${lates} tarde${lates !== 1 ? 's' : ''})`
    : 'sin registros de asistencia en el sistema';

  const gradeStr = combined !== null
    ? `un promedio académico de ${combined.toFixed(2)}/20 (tareas: ${avgGrade !== null ? avgGrade.toFixed(2) : 'N/A'}, exámenes: ${quizAvg !== null ? quizAvg.toFixed(2) : 'N/A'})`
    : 'sin calificaciones registradas aún';

  const statusStr = alertLevel === 'Verde'
    ? 'El estudiante muestra un desempeño estable y no presenta señales de riesgo inmediato.'
    : alertLevel === 'Amarillo'
    ? 'El estudiante presenta algunas señales de alerta que requieren seguimiento preventivo.'
    : alertLevel === 'Naranja'
    ? 'El estudiante muestra indicadores de riesgo elevado que requieren intervención pronta.'
    : 'El estudiante presenta un perfil de riesgo crítico con posibilidad alta de abandono.';

  return `${name} registra ${attStr} sobre un total de ${totalRecords} clases, con ${totalSubs} tarea(s) entregada(s) y ${totalQuizzes} examen(es) realizado(s). Su rendimiento académico muestra ${gradeStr}. ${statusStr}`;
}

// ──────────────────────────────────────────────
// Generación de recomendaciones
// ──────────────────────────────────────────────
function buildRecommendations(
  alertLevel: string,
  attendanceRate: number,
  combinedGrade: number | null,
  absences: number,
  trendScore: number
): string[] {
  const recs: string[] = [];

  if (alertLevel === 'Rojo') {
    recs.push('⚠️ Contactar al estudiante de forma inmediata (llamada o reunión en persona) para identificar la causa del abandono.');
    recs.push('📋 Activar el protocolo de seguimiento de deserción y reportar al coordinador de carrera.');
  }

  if (alertLevel === 'Naranja' || alertLevel === 'Rojo') {
    recs.push('🎓 Derivar al estudiante al servicio de tutoría académica personalizada con sesiones semanales obligatorias.');
    recs.push('🧠 Evaluar si existen factores socioeconómicos o emocionales que afectan el rendimiento; coordinar con bienestar estudiantil.');
  }

  if (attendanceRate < 85) {
    recs.push(`📅 Revisar el historial de ausencias (${absences} en total) y verificar si existen justificaciones pendientes. Aplicar el reglamento de asistencia mínima si corresponde.`);
  }

  if (combinedGrade !== null && combinedGrade < 11) {
    recs.push('📚 Diseñar un plan de recuperación académica individualizado, identificando los temas con mayor dificultad para reforzarlos.');
  }

  if (alertLevel === 'Amarillo') {
    recs.push('👀 Monitorear el desempeño del estudiante con revisiones quincenales para detectar deterioro temprano.');
    recs.push('💬 Mantener comunicación proactiva con el estudiante para verificar su compromiso y motivación.');
  }

  if (alertLevel === 'Verde') {
    recs.push('✅ Mantener el seguimiento estándar. El estudiante muestra un rendimiento adecuado.');
    recs.push('🌟 Considerar involucrar al estudiante en actividades de refuerzo o mentoría para consolidar su desempeño.');
  }

  if (trendScore < 50) {
    recs.push('📉 Se detecta deterioro en las últimas 2 semanas. Verificar si hay cambios en la situación personal o académica del estudiante.');
  }

  return recs.slice(0, 5); // máximo 5 recomendaciones
}

// ──────────────────────────────────────────────
// Mensaje de notificación para el alumno
// ──────────────────────────────────────────────
export function buildStudentNotification(
  studentName: string,
  alertLevel: RiskAnalysisOutput['alertLevel'],
  riskLevel: RiskAnalysisOutput['riskLevel'],
  attendanceRate: number
): { title: string; message: string } {
  switch (alertLevel) {
    case 'Rojo':
      return {
        title: '🔴 Alerta Académica Urgente',
        message: `Hola ${studentName}, hemos detectado indicadores críticos en tu desempeño académico (asistencia: ${attendanceRate.toFixed(0)}%). Es fundamental que te comuniques con tu tutor o coordinador a la brevedad para que te brinden el apoyo necesario.`,
      };
    case 'Naranja':
      return {
        title: '🟠 Atención: Riesgo Académico Alto',
        message: `Hola ${studentName}, tu perfil académico muestra señales de riesgo que necesitan atención. Tu tasa de asistencia es de ${attendanceRate.toFixed(0)}%. Te recomendamos contactar a tu tutor y aprovechar los recursos de apoyo disponibles.`,
      };
    case 'Amarillo':
      return {
        title: '🟡 Aviso Preventivo Académico',
        message: `Hola ${studentName}, hemos identificado algunas áreas de tu desempeño que merecen atención. Mantén tu compromiso con la asistencia (actualmente ${attendanceRate.toFixed(0)}%) y consulta con tu docente ante cualquier duda.`,
      };
    case 'Verde':
    default:
      return {
        title: '🟢 Tu Desempeño Académico Va Bien',
        message: `Hola ${studentName}, tu rendimiento académico es estable. Sigue así y no dudes en usar los recursos de la universidad para seguir mejorando.`,
      };
  }
}
