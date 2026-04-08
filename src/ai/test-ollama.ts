import { ai } from './genkit';

async function testOllama() {
  console.log('--- Iniciando prueba con Ollama (llama3) ---');
  try {
    const response = await ai.generate({
      model: 'ollama/llama3',
      prompt: 'Hola, dime en español qué día es hoy (19 de enero 2026) y confirma que estás funcionando con un modelo local (Ollama).',
    });
    console.log('Respuesta de Ollama:', response.text);
  } catch (error) {
    console.error('Error al conectar con Ollama:', error);
    console.log('\nCONSEJO: Asegúrate de tener Ollama corriendo y haber ejecutado "ollama pull llama3"');
  }
}

testOllama();