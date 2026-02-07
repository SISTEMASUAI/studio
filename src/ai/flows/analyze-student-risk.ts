'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas básicos
const UserProfileSchema = z.object({
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

const AttendanceRecordSchema = z.object({
  status: z.enum(['presente', 'ausente', 'tarde', 'justificado']),
  date: z.string(),
  courseId: z.string(),
});

const AssignmentSubmissionSchema = z.object({
  grade: z.number().optional(),
  assignmentId: z.string(),
  submittedAt: z.string(),
  courseId: z.string().optional(),
});

const QuizResultSchema = z.object({
  score: z.number(),
  quizId: z.string(),
  completionDate: z.string(),
  courseId: z.string(),
});

// Input schema extendido
const AnalyzeStudentRiskInputSchema = z.object({
  student: UserProfileSchema,
  attendance: z.array(AttendanceRecordSchema),
  submissions: z.array(AssignmentSubmissionSchema),
  quizzes: z.array(QuizResultSchema),
});

export type AnalyzeStudentRiskInput = z.infer<typeof AnalyzeStudentRiskInputSchema>;

// Schema de salida
const AnalyzeStudentRiskOutputSchema = z.object({
  riskLevel: z.enum(['Bajo', 'Medio', 'Alto']).describe('Nivel de riesgo académico general'),
  riskOfDropout: z.enum(['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto']).describe('Probabilidad estimada de deserción'),
  summary: z.string().describe('Resumen de 3 a 5 oraciones explicando patrones de asistencia y notas'),
  supportRecommendations: z.array(z.string()).describe('Recomendaciones concretas para el tutor'),
  alertLevel: z.enum(['Verde', 'Amarillo', 'Naranja', 'Rojo']).describe('Color de alerta visual'),
});

export type AnalyzeStudentRiskOutput = z.infer<typeof AnalyzeStudentRiskOutputSchema>;

export async function analyzeStudentRisk(
  input: AnalyzeStudentRiskInput
): Promise<AnalyzeStudentRiskOutput> {
  return analyzeStudentRiskFlow(input);
}

const analyzeStudentRiskFlow = ai.defineFlow(
  {
    name: 'analyzeStudentRiskFlow',
    inputSchema: AnalyzeStudentRiskInputSchema,
    outputSchema: AnalyzeStudentRiskOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      prompt: `
Eres un experto en retención estudiantil universitaria. Tu misión es analizar el rendimiento de un estudiante y predecir su riesgo de deserción.

DATOS DEL ESTUDIANTE:
- Perfil: ${JSON.stringify(input.student)}
- Asistencias: ${JSON.stringify(input.attendance)}
- Tareas Entregadas: ${JSON.stringify(input.submissions)}
- Exámenes realizados: ${JSON.stringify(input.quizzes)}

CRITERIOS DE ANÁLISIS (Escala 0-20):
1. Rendimiento Académico: Notas de tareas y exámenes. Un promedio por debajo de 11 es crítico.
2. Compromiso: Falta de entregas de tareas o inasistencias superiores al 30%.
3. Tendencia: ¿Las notas están bajando en las últimas semanas? ¿Hay ausencias consecutivas recientes?

TAREAS:
- Evalúa la correlación entre la asistencia y las notas (¿faltar a clase está afectando sus exámenes?).
- Identifica si el riesgo es puramente académico (malas notas) o de compromiso (faltas/no entregas).
- Determina el nivel de alerta (Rojo para abandono inminente, Naranja para riesgo alto, Amarillo preventivo, Verde estable).

Devuelve un JSON con: riskLevel, riskOfDropout, summary, supportRecommendations y alertLevel.
      `,
      output: { schema: AnalyzeStudentRiskOutputSchema },
    });

    const output = response.output;
    if (!output) throw new Error("No se recibió una respuesta válida del modelo.");
    return output as AnalyzeStudentRiskOutput;
  }
);
