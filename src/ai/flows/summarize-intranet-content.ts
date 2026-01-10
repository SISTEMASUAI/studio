'use server';

/**
 * @fileOverview An AI agent to summarize intranet content.
 *
 * - summarizeIntranetContent - A function that summarizes intranet content.
 * - SummarizeIntranetContentInput - The input type for the summarizeIntranetContent function.
 * - SummarizeIntranetContentOutput - The return type for the summarizeIntranetContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIntranetContentInputSchema = z.object({
  content: z.string().describe('The intranet content to summarize.'),
});
export type SummarizeIntranetContentInput = z.infer<typeof SummarizeIntranetContentInputSchema>;

const SummarizeIntranetContentOutputSchema = z.object({
  summary: z.string().describe('The summary of the intranet content.'),
});
export type SummarizeIntranetContentOutput = z.infer<typeof SummarizeIntranetContentOutputSchema>;

export async function summarizeIntranetContent(
  input: SummarizeIntranetContentInput
): Promise<SummarizeIntranetContentOutput> {
  return summarizeIntranetContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIntranetContentPrompt',
  input: {schema: SummarizeIntranetContentInputSchema},
  output: {schema: SummarizeIntranetContentOutputSchema},
  prompt: `Summarize the following intranet content: {{{content}}}`,
});

const summarizeIntranetContentFlow = ai.defineFlow(
  {
    name: 'summarizeIntranetContentFlow',
    inputSchema: SummarizeIntranetContentInputSchema,
    outputSchema: SummarizeIntranetContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
