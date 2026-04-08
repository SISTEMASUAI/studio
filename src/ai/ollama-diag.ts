import fetch from 'node-fetch';

async function diagnose() {
  const targets = [
    'http://127.0.0.1:11434',
    'http://localhost:11434',
    'http://[::1]:11434'
  ];

  console.log('--- Diagnóstico de Conexión Ollama ---');
  
  for (const url of targets) {
    console.log(`\nProbando ${url}...`);
    try {
      const resp = await fetch(`${url}/api/tags`, { method: 'GET', timeout: 2000 });
      if (resp.ok) {
        const data = await resp.json() as any;
        console.log(`✅ ¡Conectado con éxito a ${url}!`);
        console.log('Modelos disponibles:', data.models?.map((m: any) => m.name).join(', ') || 'Ninguno');
        
        const hasLlama3 = data.models?.some((m: any) => m.name.includes('llama3'));
        if (hasLlama3) {
            console.log('✨ El modelo "llama3" está listo para usar.');
        } else {
            console.log('⚠️  ATENCIÓN: Tienes conexión pero NO tienes el modelo "llama3" descargado.');
            console.log('   Ejecuta: ollama pull llama3');
        }
      } else {
        console.log(`❌ El servidor respondió con error ${resp.status} en ${url}`);
      }
    } catch (err: any) {
      console.log(`❌ Error al conectar con ${url}: ${err.message}`);
    }
  }

  console.log('\n--- Fin del Diagnóstico ---');
  console.log('Si todos fallaron, asegúrate de que Ollama esté abierto y el servicio "Ollama Serve" activo.');
}

diagnose();
