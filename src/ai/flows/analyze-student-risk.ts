'use server';

/**
 * @fileOverview An AI agent to analyze student academic risk.
 * 
 * - analyzeStudentRisk - A function that analyzes student data.
 * - AnalyzeStudentRiskInput - The input type for the analyzeStudentRisk function.
 * - AnalyzeStudentRiskOutput - The return type for the analyzeStudentRisk function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define Zod schemas based on Firestore structure for type safety
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

export const AnalyzeStudentRiskInputSchema = z.object({
  student: UserProfileSchema,
  attendance: z.array(AttendanceRecordSchema),
  submissions: z.array(AssignmentSubmissionSchema),
});
export type AnalyzeStudentRiskInput = z.infer<typeof AnalyzeStudentRiskInputSchema>;

export const AnalyzeStudentRiskOutputSchema = z.object({
  riskLevel: z.enum(['Bajo', 'Medio', 'Alto']).describe('The estimated academic risk level for the student.'),
  summary: z.string().describe('A concise summary explaining the reasoning for the risk assessment, highlighting key patterns in attendance and grades.'),
  recommendations: z.array(z.string()).describe('A list of 2-3 actionable recommendations for academic advisors or tutors.'),
});
export type AnalyzeStudentRiskOutput = z.infer<typeof AnalyzeStudentRiskOutputSchema>;


export async function analyzeStudentRisk(
  input: AnalyzeStudentRiskInput
): Promise<AnalyzeStudentRiskOutput> {
  return analyzeStudentRiskFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeStudentRiskPrompt',
  input: { schema: AnalyzeStudentRiskInputSchema },
  output: { schema: AnalyzeStudentRiskOutputSchema },
  prompt: `
    You are an expert academic advisor AI for a university. Your task is to analyze a student's academic data to identify potential risks of falling behind or dropping out.

    Based on the provided JSON data (student profile, attendance records, and assignment submissions), perform a thorough analysis.

    DATA:
    - Student Profile: {{{json student}}}
    - Attendance Records: {{{json attendance}}}
    - Assignment Submissions: {{{json submissions}}}

    ANALYSIS GUIDELINES:
    1.  **Risk Level Assessment**: Categorize the student's risk as 'Bajo', 'Medio', or 'Alto'.
        -   **Alto Riesgo**: Consistent absences ('ausente'), multiple late attendances ('tarde'), failing grades (below 11 out of 20), or a clear downward trend in performance. A combination of poor attendance and low grades is a strong indicator.
        -   **Riesgo Medio**: Some absences or late attendances, grades that are barely passing (e.g., 11-13), or a recent drop in performance.
        -   **Riesgo Bajo**: Good attendance ('presente', 'justificado'), and consistently good grades (above 14).
    2.  **Summary**: Write a concise, 2-3 sentence summary explaining your risk assessment. Mention specific patterns you observed, for example, "El estudiante muestra un patrón de ausencias recurrentes en el curso X y una tendencia a la baja en las calificaciones de las últimas tareas, lo que indica un alto riesgo."
    3.  **Recommendations**: Provide 2-3 brief, actionable recommendations for an academic advisor. Examples: "Contactar al estudiante para una sesión de tutoría académica", "Recomendar una cita con el servicio de bienestar estudiantil", "Sugerir al profesor del curso X que converse con el estudiante".

    Return your complete analysis strictly in the requested JSON output format.
  `,
});


const analyzeStudentRiskFlow = ai.defineFlow(
  {
    name: 'analyzeStudentRiskFlow',
    inputSchema: AnalyzeStudentRiskInputSchema,
    outputSchema: AnalyzeStudentRiskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid analysis.");
    }
    return output;
  }
);
