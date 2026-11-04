import { Router } from 'express';
import { config } from '../config.js';
import {
  buildExecutable,
  checkSyntax,
  CompilerUnavailableError,
  generateAsm,
  generateTac,
  resolveCommand,
  runProgram,
} from '../compiler/index.js';

export const api = Router();

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readCode(body) {
  const code = body?.code;
  if (typeof code !== 'string') throw new RequestError(400, 'Falta el campo "code" (texto).');
  if (Buffer.byteLength(code, 'utf8') > config.maxCodeBytes) {
    throw new RequestError(413, `El código supera el límite de ${config.maxCodeBytes / 1024} KB.`);
  }
  return code;
}

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (err) {
    next(err);
  }
};

api.get('/health', handle(async (_req, res) => {
  try {
    const { mode } = await resolveCommand();
    await checkSyntax(''); // detecta binarios que existen pero no arrancan (librerías faltantes)
    res.json({ ok: true, bmlangPath: config.bmlangPath, mode });
  } catch (err) {
    if (!(err instanceof CompilerUnavailableError)) throw err;
    res.json({ ok: false, bmlangPath: config.bmlangPath, message: err.message });
  }
}));

api.post('/check', handle(async (req, res) => {
  res.json(await checkSyntax(readCode(req.body)));
}));

// Fases de generación (ver el contrato en backend/src/compiler/index.js).
// 501 solo cuando el generador aún no existe; los errores del programa son 200 con ok: false.
for (const [route, phase] of [['/tac', generateTac], ['/asm', generateAsm], ['/build', buildExecutable], ['/run', runProgram]]) {
  api.post(route, handle(async (req, res) => {
    const code = readCode(req.body);
    const stdin = typeof req.body.stdin === 'string' ? req.body.stdin : '';
    if (Buffer.byteLength(stdin, 'utf8') > config.maxCodeBytes) {
      throw new RequestError(413, `La entrada (stdin) supera el límite de ${config.maxCodeBytes / 1024} KB.`);
    }
    const result = await phase({ code, stdin });
    res.status(result.pending ? 501 : 200).json(result);
  }));
}

// eslint-disable-next-line no-unused-vars
export function apiErrorHandler(err, _req, res, _next) {
  if (err instanceof RequestError) {
    return res.status(err.status).json({ ok: false, errors: [{ line: null, message: err.message }], raw: '' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, errors: [{ line: null, message: `El código supera el límite de ${config.maxCodeBytes / 1024} KB.` }], raw: '' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, errors: [{ line: null, message: 'JSON inválido.' }], raw: '' });
  }
  if (err instanceof CompilerUnavailableError) {
    return res.status(503).json({ ok: false, unavailable: true, errors: [{ line: null, message: err.message }], raw: '' });
  }
  console.error(err);
  return res.status(500).json({ ok: false, errors: [{ line: null, message: 'Error interno del servidor.' }], raw: '' });
}
