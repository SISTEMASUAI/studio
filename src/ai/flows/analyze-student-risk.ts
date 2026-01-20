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
});

// Input schema
const AnalyzeStudentRiskInputSchema = z.object({
  student: UserProfileSchema,
  attendance: z.array(AttendanceRecordSchema),
  submissions: z.array(AssignmentSubmissionSchema),
});

export type AnalyzeStudentRiskInput = z.infer<typeof AnalyzeStudentRiskInputSchema>;

// Schema de salida extendido y alineado con el prompt
const AnalyzeStudentRiskOutputSchema = z.object({
  riskLevel: z.enum(['Bajo', 'Medio', 'Alto']).describe('Nivel de riesgo académico general'),
  riskOfDropout: z.enum(['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto']).describe('Probabilidad estimada de deserción'),
  summary: z.string().describe('Resumen en 3-5 oraciones explicando patrones y riesgo'),
  supportRecommendations: z.array(z.string()).describe('2-4 recomendaciones concretas y accionables'),
  alertLevel: z.enum(['Verde', 'Amarillo', 'Naranja', 'Rojo']).describe('Nivel de alerta visual para el tutor/docente'),
});

export type AnalyzeStudentRiskOutput = z.infer<typeof AnalyzeStudentRiskOutputSchema>;

// Función exportada
export async function analyzeStudentRisk(
  input: AnalyzeStudentRiskInput
): Promise<AnalyzeStudentRiskOutput> {
  return analyzeStudentRiskFlow(input);
}

// Flujo principal
const analyzeStudentRiskFlow = ai.defineFlow(
  {
    name: 'analyzeStudentRiskFlow',
    inputSchema: AnalyzeStudentRiskInputSchema,
    outputSchema: AnalyzeStudentRiskOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      prompt: `
Eres un experto en retención estudiantil en universidades peruanas. Tu misión es analizar el perfil académico de un estudiante y determinar su riesgo real de deserción (decertar) durante el semestre.

Analiza cuidadosamente los siguientes datos del estudiante:

PERFIL:
${JSON.stringify(input.student, null, 2)}

ASISTENCIAS (registros por curso y fecha):
${JSON.stringify(input.attendance, null, 2)}

ENTREGAS DE TAREAS / CALIFICACIONES:
${JSON.stringify(input.submissions, null, 2)}

CRITERIOS DE EVALUACIÓN DE RIESGO DE DESERCIÓN (escala peruana típica 0-20):
- ALTO RIESGO DE DESERCIÓN (probabilidad > 60%):
  • Más del 30% de ausencias injustificadas
  • Promedio de asistencias < 60% en algún curso clave
  • Varias notas por debajo de 11
  • Tendencia clara de empeoramiento (asistencia y/o notas bajando)
  • Ausencias consecutivas recientes (últimas 3-4 semanas)

- RIESGO MEDIO (probabilidad 30-60%):
  • 15-30% de ausencias
  • Notas entre 11-13 en promedio
  • Algunas ausencias consecutivas o tardanzas frecuentes
  • Mejora o empeoramiento leve reciente

- BAJO RIESGO (<30%):
  • Asistencia > 85%
  • Notas consistentes ≥14
  • Sin patrones preocupantes

TAREAS DEL ANÁLISIS:
1. Calcula porcentajes reales de asistencia por curso y en general
2. Identifica tendencias (¿está empeorando la asistencia o las notas?)
3. Correlaciona asistencia con rendimiento académico
4. Determina nivel de riesgo con justificación clara y objetiva

Devuelve **SOLO** el siguiente JSON, sin ningún texto adicional fuera del objeto:
{
  "riskLevel": "Alto" | "Medio" | "Bajo",
  "riskOfDropout": "Muy alto" | "Alto" | "Moderado" | "Bajo" | "Muy bajo",
  "summary": "Resumen en 3-5 oraciones explicando los patrones detectados y el riesgo de deserción",
  "supportRecommendations": [
    "Recomendación 1 concreta y accionable",
    "Recomendación 2...",
    "Recomendación 3... (máximo 4)"
  ],
  "alertLevel": "Rojo" | "Naranja" | "Amarillo" | "Verde"
}
      `,
      output: { schema: AnalyzeStudentRiskOutputSchema },
    });

    const output = response.output;

    if (!output) {
      throw new Error("No se recibió una respuesta válida del modelo.");
    }

    return output as AnalyzeStudentRiskOutput;
  }
);