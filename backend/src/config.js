import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Raíz del paquete backend/: las rutas relativas de BMLANG_PATH se resuelven desde aquí,
// así el valor por defecto "../compilador/bmlang" apunta al binario del analizador.
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3001,
  bmlangPath: path.resolve(backendRoot, process.env.BMLANG_PATH || '../compilador/bmlang'),
  // auto: en Windows, si el binario es ELF (Linux) se ejecuta con wsl.exe; si no, directo.
  runner: (process.env.BMLANG_RUNNER || 'auto').toLowerCase(),
  wslDistro: process.env.BMLANG_WSL_DISTRO || '',
  timeoutMs: Number(process.env.BMLANG_TIMEOUT_MS) || 5000,
  maxCodeBytes: 100 * 1024,
  maxOutputBytes: 64 * 1024,
};
