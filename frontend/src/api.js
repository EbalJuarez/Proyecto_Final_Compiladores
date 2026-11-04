async function post(path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, errors: [{ line: null, message: 'No se pudo contactar al servidor. ¿Está corriendo "npm run dev"?' }], raw: '' };
  }
  try {
    return await res.json();
  } catch {
    return { ok: false, errors: [{ line: null, message: `Respuesta inválida del servidor (HTTP ${res.status}).` }], raw: '' };
  }
}

// Todas devuelven { ok, errors: [{ line, message }], raw?, output?, pending? }.
// `pending: true` significa que bmlang aún no soporta la fase ("Generador aún no implementado").
export const checkSyntax = (code) => post('/check', { code });
export const generateTac = (code) => post('/tac', { code });
export const generateAsm = (code) => post('/asm', { code });
export const buildExecutable = (code) => post('/build', { code }); // + { executable (base64), fileName }
export const runProgram = (code, stdin) => post('/run', { code, stdin });

export async function getHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { ok: false, message: 'Servidor no disponible.' };
  }
}
