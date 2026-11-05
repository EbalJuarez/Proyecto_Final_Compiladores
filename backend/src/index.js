import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSyntax } from './compiler/index.js';
import { config } from './config.js';
import { api, apiErrorHandler } from './routes/api.js';

const app = express();

// El body JSON admite algo más que el límite de código para que el mensaje 413
// lo genere readCode() con un texto claro.
app.use(express.json({ limit: config.maxCodeBytes * 2 }));
app.use('/api', api);
app.use('/api', apiErrorHandler);

// En producción (npm run build && npm start) se sirve el frontend compilado.
// En desarrollo el proxy de Vite reenvía /api a este servidor.
const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.listen(config.port, '127.0.0.1', () => {
  console.log(`BMLang IDE server en http://localhost:${config.port}`);
  console.log(`Binario: ${config.bmlangPath} (runner: ${config.runner})`);
  // Arranca WSL de antemano: el primer arranque de la VM puede tardar más que el timeout.
  checkSyntax('').catch(() => {});
});
