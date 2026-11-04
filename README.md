# BMLang IDE

IDE web para el lenguaje **BMLang** — Proyecto final de Compiladores, Universidad Mesoamericana.

El análisis léxico y sintáctico lo hace el ejecutable `compilador/bmlang` (Flex + Bison); el
IDE solo lo invoca y muestra el resultado.

```
.
├── compilador/                       ← analizador (Flex/Bison)
│   ├── bmlang.l, bmlang.y            ← fuentes
│   └── archivos generados localmente (ignorados por Git)
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
├── generacion/                       ← esqueletos de código intermedio y NASM (siguiente etapa)
├── docs/
│   ├── Gramatica proyecto.pdf
│   ├── propuesta-numero-de-linea.md  ← ya aplicada
│   └── propuesta-numeros-negativos.md ← menos unario (aplicada)
├── ejemplos/                         ← programas fuente .bml
└── package.json                      ← levanta backend y frontend juntos
```

## Requisitos

- Node.js 18 o superior (probado con Node 26) y npm. En Linux sin permisos de administrador
  puedes descomprimir el binario oficial de <https://nodejs.org> en `~/.local/opt` y agregar
  su carpeta `bin` al `PATH`.
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

Primero compila el analizador en Linux o WSL, desde la raíz del proyecto:

```bash
bison -d -o compilador/bmlang.tab.c compilador/bmlang.y
flex -o compilador/lex.yy.c compilador/bmlang.l
gcc -Icompilador -o compilador/bmlang compilador/bmlang.tab.c compilador/lex.yy.c
```

Después instala las dependencias e inicia la aplicación:

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
| `BMLANG_PATH` | `../compilador/bmlang` (en Windows, `../compilador/bmlang.exe` si existe) | Ruta al ejecutable. Las rutas relativas se resuelven desde `backend/`. |
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
- **Validar** (Ctrl+Enter): muestra “✔ Sintaxis correcta” o el error con línea y texto, y marca
  la línea en el editor (marker + decoración). Clic en un error de la consola salta a la línea.
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

## Pruebas

`npm test` corre, contra el `bmlang` real: `ejemplos/entrada_valida.bml`, los tres ejemplos del
IDE, casos inválidos (falta `;`, falta `}`, token desconocido, `IF` sin cerrar, comentario sin
cerrar; cada uno con línea y texto) y casos válidos (`$x:2`, `DEC $a,$b;`, IF anidado, `&&`/`||`,
WHILE, FOR, comentarios `#! !#`).

## Limitaciones del analizador actual

- Los errores incluyen la línea y el token cercano; el detalle depende del mensaje genérico de
  Bison (el backend lo traduce a “error de sintaxis”). En un `;` faltante la línea reportada es
  la del token siguiente, porque ahí es donde Bison detecta el error.
- El menos unario (`$a-1`, `-5`, `-$a`, `$b-(-2)`) está soportado desde
  `docs/propuesta-numeros-negativos.md`; la gramática del PDF equivale a `<factor>::= ... | - <factor>`.
- Por diseño del lexer, un comentario `#! ... !#` debe cerrarse en la misma línea; el editor
  lo marca como inválido si no se cierra.
- Según la gramática, `WRITE` solo acepta una variable y no se permiten comentarios después
  del `}` final.
- La generación de código intermedio y NASM todavía no está implementada.
