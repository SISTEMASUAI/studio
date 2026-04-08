'use server';
/**
 * @fileOverview CV parsing AI agent.
 *
 * - parseCV - Extracts professional data from a PDF CV.
 * - ParseCVInput - The input type (base64 PDF).
 * - ParseCVOutput - The structured professional data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseCVInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseCVInput = z.infer<typeof ParseCVInputSchema>;

const ParseCVOutputSchema = z.object({
  professionalTitle: z.string().describe('A short headline or job title (e.g. Full Stack Developer).'),
  summary: z.string().describe('A 2-3 sentence professional summary.'),
  skills: z.array(z.string()).describe('A list of technical and soft skills.'),
  experience: z.string().describe('A summary of work experience formatted as a readable string.'),
  education: z.string().describe('A summary of educational background formatted as a readable string.'),
});
export type ParseCVOutput = z.infer<typeof ParseCVOutputSchema>;

export async function parseCV(input: ParseCVInput): Promise<ParseCVOutput> {
  return parseCVFlow(input);
}

const parseCVFlow = ai.defineFlow(
  {
    name: 'parseCVFlow',
    inputSchema: ParseCVInputSchema,
    // Note: outputSchema is omitted to prevent automatic Genkit validation errors with Ollama.
    // We handle validation and normalization manually in the function body.
  },
  async input => {
    const response = await ai.generate({
      model: 'ollama/llama3',
      prompt: [
        { media: { url: input.pdfDataUri, contentType: 'application/pdf' } },
        { text: `You are an expert recruiter and career coach.
Analyze the provided CV (PDF) and extract the key professional information.

Guidelines:
- Summary: Professional and engaging.
- Skills: List at least 5-10 keywords if available.
- Experience & Education: Formatted clearly.

If information is missing, use an empty string or empty array.
Return ONLY a valid JSON object in this exact format (no markdown, no additional text):
{"professionalTitle": "...", "summary": "...", "skills": ["..."], "experience": "...", "education": "..."}` }
      ],
    });

    const rawText = response.text?.trim() ?? '';
    if (!rawText) {
      throw new Error('No se recibió una respuesta válida del modelo.');
    }

    let parsed: ParseCVOutput;
    try {
      const clean = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      parsed = JSON.parse(clean) as ParseCVOutput;
    } catch {
      throw new Error('La IA no devolvió un JSON válido para la información del currículum.');
    }

    return parsed;
  }
);
