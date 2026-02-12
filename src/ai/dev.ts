
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-intranet-content.ts';
import '@/ai/flows/analyze-student-risk.ts';
import '@/ai/flows/parse-cv-flow.ts';
import '@/ai/flows/match-jobs-flow.ts';
