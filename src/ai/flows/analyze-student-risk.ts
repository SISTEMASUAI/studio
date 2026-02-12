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
  supportRecommendations: z.array(z.string()).describe('Lista de 3-5 recomendaciones concretas y accionables para el tutor'),
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
    // Calcular métricas previas para enriquecer el prompt
    const totalAttendance = input.attendance.length;
    const absences = input.attendance.filter(a => a.status === 'ausente').length;
    const attendanceRate = totalAttendance > 0 ? ((totalAttendance - absences) / totalAttendance * 100).toFixed(1) : 'N/A';
    
    const gradesAvailable = input.submissions.filter(s => s.grade !== undefined);
    const averageGrade = gradesAvailable.length > 0 
      ? (gradesAvailable.reduce((sum, s) => sum + (s.grade || 0), 0) / gradesAvailable.length).toFixed(2)
      : 'N/A';
    
    const quizAverage = input.quizzes.length > 0
      ? (input.quizzes.reduce((sum, q) => sum + q.score, 0) / input.quizzes.length).toFixed(2)
      : 'N/A';

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      config: {
        temperature: 0.3,
        maxOutputTokens: 1500,
      },
      prompt: `
Eres un experto en retención estudiantil universitaria con 15 años de experiencia. Tu misión es analizar el rendimiento de un estudiante y predecir su riesgo de deserción basándote en datos académicos objetivos.

PERFIL DEL ESTUDIANTE:
Nombre: ${input.student.firstName} ${input.student.lastName}
ID: ${input.student.uid}

MÉTRICAS CALCULADAS:
- Tasa de asistencia: ${attendanceRate}%
- Promedio de tareas: ${averageGrade}/20
- Promedio de exámenes: ${quizAverage}/20
- Total de asistencias registradas: ${totalAttendance}
- Total de ausencias: ${absences}
- Tareas entregadas: ${input.submissions.length}
- Exámenes realizados: ${input.quizzes.length}

DATOS DETALLADOS:
Asistencias: ${JSON.stringify(input.attendance, null, 2)}
Tareas: ${JSON.stringify(input.submissions, null, 2)}
Exámenes: ${JSON.stringify(input.quizzes, null, 2)}

CRITERIOS DE ANÁLISIS (Sistema de evaluación 0-20):
1. **Rendimiento Académico** (40% del peso):
   - Promedio ≥ 14: Excelente
   - Promedio 11-13: Aceptable
   - Promedio < 11: CRÍTICO (alto riesgo)
   
2. **Compromiso y Asistencia** (35% del peso):
   - Asistencia ≥ 85%: Buen compromiso
   - Asistencia 70-84%: Compromiso moderado
   - Asistencia < 70%: CRÍTICO (posible desvinculación)
   
3. **Tendencia Temporal** (25% del peso):
   - Analiza las últimas 3-4 semanas
   - ¿Las notas están mejorando o empeorando?
   - ¿Hay ausencias consecutivas recientes (últimos 7-14 días)?
   - ¿Hay tareas sin entregar en las últimas 2 semanas?

ANÁLISIS REQUERIDO:
1. Evalúa la **correlación** entre asistencia y rendimiento: ¿Las faltas están impactando directamente las notas?
2. Identifica el **tipo de riesgo**:
   - Académico puro: Asiste pero tiene malas notas
   - Compromiso: No asiste y/o no entrega tareas
   - Mixto: Problemas en ambas áreas
3. Detecta **señales de alerta temprana**:
   - Caída repentina en asistencia
   - Deterioro progresivo en notas
   - Ausencias prolongadas sin justificar

NIVELES DE ALERTA:
- 🟢 **Verde**: Estudiante estable (asistencia >85%, notas >13)
- 🟡 **Amarillo**: Atención preventiva (asistencia 70-85% O notas 11-13)
- 🟠 **Naranja**: Riesgo alto (asistencia <70% O notas <11)
- 🔴 **Rojo**: Abandono inminente (asistencia <60% Y notas <10, o ausencias >7 días consecutivos)

RECOMENDACIONES:
Genera 3-5 recomendaciones **específicas y accionables** para el tutor, priorizadas por urgencia. Incluye:
- Intervenciones inmediatas (si aplica)
- Estrategias de seguimiento personalizado
- Recursos de apoyo específicos (tutorías, orientación psicológica, etc.)
- Plan de recuperación académica (si es necesario)

Responde ÚNICAMENTE con el JSON estructurado solicitado.
      `,
      output: { schema: AnalyzeStudentRiskOutputSchema },
    });

    const output = response.output;
    
    if (!output) {
      throw new Error("No se recibió una respuesta válida del modelo de IA.");
    }
    
    return output as AnalyzeStudentRiskOutput;
  }
);
