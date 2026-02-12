
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
      "A PDF file of a CV, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
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
    outputSchema: ParseCVOutputSchema,
  },
  async input => {
    const response = await ai.generate({
      prompt: [
        { media: { url: input.pdfDataUri, contentType: 'application/pdf' } },
        { text: `You are an expert recruiter and career coach.
Analyze the provided CV (PDF) and extract the key professional information.

Guidelines:
- Summary: Professional and engaging.
- Skills: List at least 5-10 keywords if available.
- Experience & Education: Formatted clearly.

If information is missing, use an empty string or empty array.` }
      ],
      output: { schema: ParseCVOutputSchema }
    });

    if (!response.output) {
      throw new Error('No se pudo extraer información del currículum.');
    }

    return response.output as ParseCVOutput;
  }
);
