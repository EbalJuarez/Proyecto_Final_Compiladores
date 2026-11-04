import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Raíz del paquete backend/: las rutas relativas de BMLANG_PATH se resuelven desde aquí,
// así el valor por defecto "../compilador/bmlang" apunta al binario del analizador.
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// En Windows se prefiere un bmlang.exe nativo si existe; si no, el binario de Linux vía WSL.
const nativeWindowsBin = path.resolve(backendRoot, '../compilador/bmlang.exe');
const defaultBmlang = process.platform === 'win32' && fs.existsSync(nativeWindowsBin)
  ? nativeWindowsBin
  : '../compilador/bmlang';

export const config = {
  port: Number(process.env.PORT) || 3001,
  bmlangPath: path.resolve(backendRoot, process.env.BMLANG_PATH || defaultBmlang),
  // auto: en Windows, si el binario es ELF (Linux) se ejecuta con wsl.exe; si no, directo.
  runner: (process.env.BMLANG_RUNNER || 'auto').toLowerCase(),
  wslDistro: process.env.BMLANG_WSL_DISTRO || '',
  // Ensamblador y enlazador para "Generar ejecutable" / "Ejecutar" (por defecto, los del PATH).
  nasmPath: process.env.NASM_PATH || 'nasm',
  ldPath: process.env.LD_PATH || 'ld',
  // Límite de tiempo del analizador, de nasm/ld y del programa compilado.
  timeoutMs: Number(process.env.BMLANG_TIMEOUT_MS) || 5000,
  maxCodeBytes: 100 * 1024,
  maxOutputBytes: 100 * 1024,
};
