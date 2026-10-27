# BMLang IDE

IDE web para el lenguaje **BMLang** — Proyecto final de Compiladores, Universidad Mesoamericana.

El análisis léxico y sintáctico lo hace el ejecutable `compilador/bmlang` (Flex + Bison); el
IDE solo lo invoca y muestra el resultado.

```
.
├── compilador/                       ← analizador (Flex/Bison)
│   ├── bmlang.l, bmlang.y            ← fuentes
│   ├── bmlang.tab.c/.h, lex.yy.c     ← generados
│   ├── bmlang, token_debug           ← ejecutables
│   └── entrada_valida.txt
├── frontend/                         ← React + Vite + Monaco
│   ├── public/logo-umes.png          ← logo de la universidad (agregarlo aquí)
│   └── src/
│       ├── components/               ← barra, pestañas, modal "Acerca de"
│       ├── editor/                   ← resaltado de BMLang y configuración de Monaco
│       ├── examples.js               ← programas de ejemplo
│       └── team.js                   ← integrantes para "Acerca de"
├── backend/                          ← Express
│   ├── src/
│   │   ├── routes/api.js             ← endpoints /api/*
│   │   └── compiler/
│   │       ├── parseCompilerOutput.js ← adaptador salida de bmlang → { ok, errors, raw }
│   │       ├── runner.js             ← spawn, timeout, temporales, WSL
│   │       └── index.js              ← checkSyntax + stubs tac/asm/build/run
│   └── test/                         ← pruebas del adaptador y end-to-end
├── docs/
│   ├── Gramatica proyecto.pdf
│   └── propuesta-numero-de-linea.md
└── package.json                      ← levanta backend y frontend juntos
```

## Requisitos

- Node.js 18 o superior (probado con Node 26) y npm.
- El ejecutable `bmlang` funcionando:
  - **Windows**: el binario es de Linux, así que se ejecuta automáticamente con **WSL**
    (`wsl.exe -e /mnt/c/.../bmlang`). Necesitas WSL con una distribución instalada.
  - **Linux / WSL nativo**: el binario se ejecuta directamente (debe tener `chmod +x`).

Si el binario no arranca con `libfl.so.2: cannot open shared object file`, instala la librería
o recompílalo (no necesita `-lfl`):

```bash
# dentro de WSL / Linux, en la carpeta compilador/
sudo apt-get install -y bison flex gcc
bison -d bmlang.y && flex bmlang.l && gcc bmlang.tab.c lex.yy.c -o bmlang
```

## Cómo correr

```bash
npm install     # instala raíz, frontend y backend (npm workspaces)
npm run dev     # Express en :3001 y Vite en :5173
```

Abre <http://localhost:5173>. Vite reenvía `/api` a Express (no hace falta CORS).

Otros scripts:

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas del adaptador y pruebas end-to-end con el `bmlang` real (se omiten con aviso si el binario no arranca) |
| `npm run build && npm start` | Compila el frontend y lo sirve desde Express en <http://localhost:3001> |

## Configuración

Variables de entorno del servidor:

| Variable | Por defecto | Descripción |
|---|---|---|
| `BMLANG_PATH` | `../compilador/bmlang` | Ruta al ejecutable. Las rutas relativas se resuelven desde `backend/`. |
| `BMLANG_RUNNER` | `auto` | `auto` (WSL si estás en Windows y el binario es ELF), `wsl` o `native`. |
| `BMLANG_WSL_DISTRO` | (distro por defecto) | Distribución de WSL a usar, p. ej. `Ubuntu`. |
| `BMLANG_TIMEOUT_MS` | `5000` | Tiempo máximo de ejecución del analizador. |
| `PORT` | `3001` | Puerto de Express. |

Ejemplos:

```bash
# Git Bash / Linux
BMLANG_PATH=/ruta/a/bmlang npm run dev
```

```powershell
# PowerShell
$env:BMLANG_PATH = "C:\ruta\a\bmlang"; npm run dev
```

## Logo

Coloca el logo en **`frontend/public/logo-umes.png`** (se muestra a 40 px de alto). Mientras no
exista, el encabezado muestra un recuadro verde "UMES".

## Funciones

- **Abrir** `.bml` (Ctrl+O), con validación de extensión y tamaño (100 KB).
- **Editar** en Monaco con números de línea y resaltado de BMLang.
- **Guardar** `.bml` (Ctrl+S): File System Access API (Chrome/Edge) con respaldo a descarga.
- **Validar** (Ctrl+Enter): muestra “✔ Sintaxis correcta” o el error; si el analizador reporta
  la línea, la marca en el editor (ver *Limitaciones*). Clic en un error de la consola salta a la línea.
- **Cargar ejemplo**: E/S, IF/ELSE anidado con `&&`/`||`, FOR y WHILE.
- **Acerca de**: integrantes (editar `frontend/src/team.js`).
- **Código intermedio, Código NASM, Generar ejecutable, Ejecutar**: botones y paneles listos;
  muestran “Disponible próximamente”.

## API

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok, bmlangPath, mode }` o `{ ok: false, message }` |
| POST | `/api/check` | `{ code }` | `{ ok, errors: [{ line, message }], raw }` |
| POST | `/api/tac`, `/api/asm`, `/api/build`, `/api/run` | `{ code, stdin? }` | 501 `{ ok: false, errors: [{ message: "Aún no implementado" }] }` |

Códigos: 400 (falta `code`), 413 (más de 100 KB), 503 (binario no disponible: mensaje claro en `errors`).

Para implementar una fase, reemplaza el stub correspondiente en `backend/src/compiler/index.js`
usando `resolveCommand` y `runProcess` de `runner.js` (ya manejan spawn con argumentos en
arreglo, timeout y límite de salida).

## Limitaciones del analizador actual

- `bmlang` imprime `Error: syntax error` **sin número de línea**, así que el IDE muestra el error
  pero no puede marcar la línea. Ver `docs/propuesta-numero-de-linea.md` (cambio de 3 líneas).
- La asignación es `<=` (no `=>`), según `bmlang.y` y el PDF de la gramática.
- Los comentarios `#! ... !#` se resaltan en el editor, pero el lexer no los reconoce:
  un programa con comentarios da error de sintaxis.
