// src/ai/genkit.ts
import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';

export const ai = genkit({
  plugins: [
    ollama({
      models: [{ name: 'llama3' }],
      serverAddress: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
    }),
  ],
});
