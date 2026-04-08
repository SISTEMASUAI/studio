'use server';
/**
 * @fileOverview Flow to match job offers with user profiles using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MatchJobsInputSchema = z.object({
  userProfile: z.object({
    professionalTitle: z.string().optional(),
    summary: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experience: z.string().optional(),
  }),
  jobOffers: z.array(z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    description: z.string(),
    type: z.string(),
  })),
});

const MatchJobsOutputSchema = z.object({
  matches: z.array(z.object({
    jobId: z.string(),
    matchScore: z.number().describe('A score from 0 to 100 indicating how well the user fits the job.'),
    reason: z.string().describe('A short sentence explaining why this job matches the user.'),
  })),
});

export type MatchJobsInput = z.infer<typeof MatchJobsInputSchema>;
export type MatchJobsOutput = z.infer<typeof MatchJobsOutputSchema>;

export async function matchJobs(input: MatchJobsInput): Promise<MatchJobsOutput> {
  return matchJobsFlow(input);
}

const matchJobsFlow = ai.defineFlow(
  {
    name: 'matchJobsFlow',
    inputSchema: MatchJobsInputSchema,
    // Note: outputSchema is omitted to prevent automatic Genkit validation errors with Ollama.
    // We handle validation and normalization manually in the function body.
  },
  async (input) => {
    const response = await ai.generate({
      model: 'ollama/llama3',
      prompt: `You are an expert career counselor.
Analyze the following user profile and match it with the provided job offers.

USER PROFILE:
Title: ${input.userProfile.professionalTitle || 'N/A'}
Skills: ${input.userProfile.skills?.join(', ') || 'N/A'}
Summary: ${input.userProfile.summary || 'N/A'}
Experience: ${input.userProfile.experience || 'N/A'}

JOB OFFERS:
${JSON.stringify(input.jobOffers, null, 2)}

For each job, calculate a match score (0-100) based on skills and experience compatibility.
Provide a concise reason in Spanish for the match.
Return ONLY a valid JSON object in this exact format (no markdown, no explanation):
{"matches": [{"jobId": "...", "matchScore": 0, "reason": "..."}]}

Order results by highest matchScore first.`,
    });

    // llama3 sometimes returns a raw array instead of the wrapped object.
    // We normalise the raw text to always get { matches: [...] }.
    const rawText = response.text?.trim() ?? '';
    console.log('DEBUG: Raw response from Ollama:', rawText);
    
    let parsed: unknown;
    try {
      // More robust cleaning: find the first { or [ and the last } or ]
      const firstBrace = rawText.indexOf('{');
      const firstBracket = rawText.indexOf('[');
      const startIdx = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
      
      const lastBrace = rawText.lastIndexOf('}');
      const lastBracket = rawText.lastIndexOf(']');
      const endIdx = Math.max(lastBrace, lastBracket);

      if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        throw new Error('No JSON found in response');
      }

      const clean = rawText.substring(startIdx, endIdx + 1).trim()
        .replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas
      
      console.log('DEBUG: Cleaned JSON string:', clean);
      parsed = JSON.parse(clean);
    } catch (err) {
      console.error('DEBUG: JSON Parse Error:', err);
      throw new Error(`La IA no devolvió un JSON válido para el emparejamiento de empleos. Detalle: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Normalise: if the model returned an array, wrap it
    let output: MatchJobsOutput;
    if (Array.isArray(parsed)) {
      output = { matches: parsed as MatchJobsOutput['matches'] };
    } else if (parsed && typeof parsed === 'object' && 'matches' in parsed) {
      output = parsed as MatchJobsOutput;
    } else {
      throw new Error('Formato de respuesta inesperado de la IA.');
    }

    return output;
  }
);
