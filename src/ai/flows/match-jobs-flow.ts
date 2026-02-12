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
    outputSchema: MatchJobsOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
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
Return the results ordered by the highest score first.`,
      output: { schema: MatchJobsOutputSchema },
    });

    if (!response.output) {
      throw new Error('No se pudo realizar el emparejamiento de empleos.');
    }

    return response.output as MatchJobsOutput;
  }
);
