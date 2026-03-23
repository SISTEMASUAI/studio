import * as dotenv from 'dotenv';
dotenv.config();  // Carga .env automáticamente (desde la raíz del proyecto)

// Opcional: debug para confirmar
console.log('GEMINI_API_KEY cargada?', !!process.env.GEMINI_API_KEY);

import { ai } from './genkit';

async function testGemini() {
  try {
    const response = await ai.generate({
      prompt: 'Hola, dime en español qué día es hoy (19 de enero 2026) y confirma que usas Gemini.',
    });
    console.log('Respuesta:', response.text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testGemini();