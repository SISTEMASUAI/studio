'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema de entrada
const SummarizeIntranetContentInputSchema = z.object({
  content: z.string().describe('Contenido de la intranet a resumir'),
});

export type SummarizeIntranetContentInput = z.infer<typeof SummarizeIntranetContentInputSchema>;

// Schema de salida
const SummarizeIntranetContentOutputSchema = z.object({
  summary: z.string().describe('Resumen claro y conciso del contenido'),
});

export type SummarizeIntranetContentOutput = z.infer<typeof SummarizeIntranetContentOutputSchema>;

// Función exportada para llamar desde Server Actions
export async function summarizeIntranetContent(
  input: SummarizeIntranetContentInput
): Promise<SummarizeIntranetContentOutput> {
  return summarizeIntranetContentFlow(input);
}

// Definición del flujo (flow)
const summarizeIntranetContentFlow = ai.defineFlow(
  {
    name: 'summarizeIntranetContentFlow',
    inputSchema: SummarizeIntranetContentInputSchema,
    outputSchema: SummarizeIntranetContentOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `
Eres un asistente experto en resumir información interna de una universidad.

Tu tarea es crear un resumen claro, conciso y profesional del siguiente contenido de intranet:

CONTENIDO:
${input.content}

Instrucciones para el resumen:
- Máximo 150-250 palabras
- Usa lenguaje formal y neutro
- Destaca los puntos principales, decisiones importantes y acciones requeridas
- Incluye fechas relevantes si las hay
- Estructura con viñetas o numeración si ayuda a la claridad
- Mantén el contexto universitario (cursos, eventos, normativas, etc.)

Devuelve SOLO el JSON con el campo "summary".
      `,
      output: { schema: SummarizeIntranetContentOutputSchema },
    });

    const output = response.output;

    if (!output) {
      throw new Error("No se recibió un resumen válido del modelo.");
    }

    return output as SummarizeIntranetContentOutput;
  }
);
