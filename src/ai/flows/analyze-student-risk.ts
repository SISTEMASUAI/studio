'use server';

import { calculateAcademicRisk, buildStudentNotification } from '@/lib/academic-risk-engine';
import type { RiskAnalysisOutput } from '@/lib/academic-risk-engine';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// ──────────────────────────────────────────────
// Tipos públicos (conservados para compatibilidad con la UI)
// ──────────────────────────────────────────────
export interface AnalyzeStudentRiskInput {
  student: {
    uid: string;
    firstName: string;
    lastName: string;
  };
  attendance: Array<{
    status: 'presente' | 'ausente' | 'tarde' | 'justificado';
    date: string;
    courseId: string;
  }>;
  submissions: Array<{
    grade?: number;
    assignmentId: string;
    submittedAt: string;
    courseId?: string;
  }>;
  quizzes: Array<{
    score: number;
    quizId: string;
    completionDate: string;
    courseId: string;
  }>;
}

// El tipo RiskAnalysisOutput se importa directamente desde '@/lib/academic-risk-engine' en la UI

// ──────────────────────────────────────────────
// Función principal — ya NO usa Ollama/Genkit
// ──────────────────────────────────────────────
export async function analyzeStudentRisk(
  input: AnalyzeStudentRiskInput
): Promise<RiskAnalysisOutput & { notificationSent: boolean }> {
  const studentName = `${input.student.firstName} ${input.student.lastName}`;

  console.log(
    `[RiskEngine] Calculando riesgo de ${studentName} | ` +
    `Asistencias: ${input.attendance.length}, ` +
    `Tareas: ${input.submissions.length}, ` +
    `Exámenes: ${input.quizzes.length}`
  );

  // 1. Calcular con el motor determinista (sincrónico, sin IA)
  const result = calculateAcademicRisk(
    input.attendance,
    input.submissions,
    input.quizzes,
    studentName
  );

  console.log(
    `[RiskEngine] Resultado: score=${result.metrics.finalScore} | ` +
    `alerta=${result.alertLevel} | riesgo=${result.riskLevel}`
  );

  // 2. Enviar notificación al alumno en Firestore
  let notificationSent = false;
  try {
    const notification = buildStudentNotification(
      input.student.firstName,
      result.alertLevel,
      result.riskLevel,
      result.metrics.attendanceRate
    );

    // Obtener instancia de Firestore desde el app ya inicializado
    const apps = getApps();
    if (apps.length > 0) {
      const db = getFirestore(apps[0]);
      await addDoc(collection(db, 'notifications'), {
        userId: input.student.uid,
        type: 'academic_risk',
        title: notification.title,
        message: notification.message,
        alertLevel: result.alertLevel,
        riskLevel: result.riskLevel,
        metrics: result.metrics,
        createdAt: new Date().toISOString(),
        read: false,
      });
      notificationSent = true;
      console.log(`[RiskEngine] ✅ Notificación enviada a ${studentName} (${result.alertLevel})`);
    } else {
      console.warn('[RiskEngine] No se encontró instancia de Firebase — notificación omitida.');
    }
  } catch (err) {
    // No queremos bloquear el resultado si la notificación falla
    console.error('[RiskEngine] Error al enviar notificación:', err);
  }

  return { ...result, notificationSent };
}
