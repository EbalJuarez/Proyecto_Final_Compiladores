# BMLang IDE

IDE web para el lenguaje **BMLang** (Basic Mathematical Language), proyecto final de Compiladores
de la Universidad Mesoamericana.

El ejecutable `compilador/bmlang` (Flex + Bison) hace el análisis léxico y sintáctico y genera el
**código de tres direcciones (TAC)** con acciones semánticas en `bmlang.y`. El backend lo traduce
con `tdc_nasm/tdc_nasm` a NASM x86 de 32 bits, lo ensambla y enlaza como ELF32, y puede ejecutar el
resultado. El IDE muestra cada fase y los errores en el editor.

```
.
├── compilador/                       ← analizador (Flex/Bison)
│   ├── bmlang.l, bmlang.y            ← analizador + generador de TAC
│   └── archivos generados localmente (ignorados por Git)
├── frontend/                         ← React + Vite + Monaco
│   ├── public/logo-umes.png          ← logo de la universidad (agregarlo aquí)
│   └── src/
│       ├── components/               ← barra, pestañas, resultados, modal "Acerca de"
│       ├── editor/                   ← resaltado de BMLang y configuración de Monaco
│       ├── examples.js               ← programas de ejemplo
│       └── team.js                   ← integrantes para "Acerca de"
├── backend/                          ← Express
│   ├── src/
│   │   ├── routes/api.js             ← endpoints /api/*
│   │   └── compiler/
│   │       ├── index.js              ← validar, TAC, NASM, ejecutable, ejecutar
│   │       ├── parseCompilerOutput.js ← salida de bmlang → { ok, errors, raw }
│   │       ├── runner.js             ← spawn, timeout, temporales, WSL
│   │       └── toolchain.js          ← nasm, ld y ejecución del programa
│   └── test/                         ← pruebas del backend con el bmlang real
├── e2e/                              ← pruebas en navegador (Playwright)
├── tdc_nasm/                         ← traductor de TAC a NASM (Flex/Bison)
├── docs/
│   ├── Gramatica proyecto.pdf
│   ├── propuesta-numero-de-linea.md  ← aplicada
│   └── propuesta-numeros-negativos.md ← menos unario (aplicada)
├── ejemplos/                         ← programas fuente .bml
└── package.json                      ← levanta backend y frontend juntos
```

## Requisitos

| Herramienta | Para qué | Instalación (Arch / Ubuntu) |
|---|---|---|
| Node.js 18+ y npm (probado con 26) | IDE (frontend y backend) | `pacman -S nodejs npm` / `apt install nodejs npm` |
| bison, flex, gcc | compilar `bmlang` | `pacman -S bison flex gcc` / `apt install bison flex gcc` |
| nasm | Generar ejecutable / Ejecutar | `pacman -S nasm` / `apt install nasm` |
| ld (binutils) | Generar ejecutable / Ejecutar | `pacman -S binutils` / `apt install binutils` |

Sin permisos de administrador puedes descomprimir el binario oficial de Node
(<https://nodejs.org>) en `~/.local/opt` y agregar su carpeta `bin` al `PATH`.

**Windows**: `bmlang`, el traductor y las herramientas NASM/LD son binarios de Linux, así que el
backend ejecuta el analizador y la toolchain con **WSL** (`wsl.exe -e ...`). Instala las
herramientas dentro de la distribución de WSL. Si existe `compilador/bmlang.exe`, se usa ese.

## Cómo correr

1. Compila el analizador y el traductor (en Linux o WSL, desde la raíz):

   ```bash
   bison -d -o compilador/bmlang.tab.c compilador/bmlang.y
   flex -o compilador/lex.yy.c compilador/bmlang.l
   gcc -Icompilador -o compilador/bmlang compilador/bmlang.tab.c compilador/lex.yy.c

   bison -d -o tdc_nasm/tdc_nasm.tab.c tdc_nasm/tdc_nasm.y
   flex -o tdc_nasm/lex.yy.c tdc_nasm/tdc_nasm.l
   gcc -o tdc_nasm/tdc_nasm tdc_nasm/tdc_nasm.tab.c tdc_nasm/lex.yy.c
   ```

2. Instala las dependencias e inicia el IDE:

   ```bash
   npm install     # raíz, frontend y backend (npm workspaces)
   npm run dev     # Express en :3001 y Vite en :5173
   ```

3. Abre <http://localhost:5173>. Vite reenvía `/api` a Express, así que no hace falta CORS.
   Express escucha solo en `127.0.0.1`; el backend de ejecución no queda expuesto a la red.

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas del backend con `bmlang`, `tdc_nasm`, nasm y ld reales. Si falta alguna herramienta, las pruebas correspondientes se omiten con un aviso. |
| `npm run test:e2e` | Pruebas en Chromium con Playwright. Levanta `npm run dev` si no está corriendo. La primera vez ejecuta `npx playwright install chromium`. Las capturas quedan en `test-results/capturas/`. |
| `npm run build && npm start` | Compila el frontend y lo sirve desde Express en <http://localhost:3001>. |

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `BMLANG_PATH` | `../compilador/bmlang` (en Windows, `../compilador/bmlang.exe` si existe) | Ejecutable del compilador. Las rutas relativas se resuelven desde `backend/`. |
| `NASM_PATH` | `nasm` (del `PATH`) | Ensamblador para Generar ejecutable y Ejecutar. |
| `LD_PATH` | `ld` (del `PATH`) | Enlazador para Generar ejecutable y Ejecutar. |
| `BMLANG_RUNNER` | `auto` | `auto` (WSL en Windows si el binario es ELF), `wsl` o `native`. |
| `BMLANG_WSL_DISTRO` | (distro por defecto) | Distribución de WSL, p. ej. `Ubuntu`. |
| `BMLANG_TIMEOUT_MS` | `5000` | Tiempo máximo del analizador, de nasm/ld y del programa ejecutado. |
| `PORT` | `3001` | Puerto de Express. |

Playwright 1.64 requiere Node.js 20 o posterior para `npm run test:e2e`; el backend, el build y
`npm test` siguen siendo compatibles con Node.js 18.

```bash
BMLANG_PATH=/ruta/a/bmlang NASM_PATH=/usr/bin/nasm npm run dev        # Linux / Git Bash
```

```powershell
$env:BMLANG_PATH = "C:\ruta\a\bmlang"; npm run dev                       # PowerShell
```

## Logo y equipo

- **Logo**: coloca el archivo en **`frontend/public/logo-umes.png`** (se muestra a 40 px de
  alto). Mientras no exista, el encabezado muestra un recuadro verde con "UMES".
- **Integrantes**: edita **`frontend/src/team.js`**. Reemplaza `[Nombre N]` y `[Carné N]` por
  los datos reales; aparecen en el botón "Acerca de".

## Funciones

- **Abrir** un `.bml` (Ctrl+O). Valida la extensión y el tamaño (máximo 100 KB).
- **Editar** en Monaco, con números de línea y resaltado de palabras reservadas, `$variables`,
  comentarios `#! … !#`, números y operadores.
- **Guardar** como `.bml` (Ctrl+S). Usa la File System Access API en Chrome/Edge y, si no está
  disponible, descarga el archivo. Los cambios sin guardar se indican con "● sin guardar" en el
  editor, la barra de estado y el título de la pestaña, y al cerrar la pestaña se pide
  confirmación.
- **Validar** (F5 o Ctrl+Enter). Muestra "✔ Sintaxis correcta" o el error con línea y texto, y
  marca la línea en el editor (subrayado, fondo y punto en el margen). Haz clic en un error de la
  consola para saltar a esa línea.
- **Código intermedio** y **Código NASM**. Se habilitan después de validar bien. El backend genera
  TAC con `bmlang --tac` y lo envía por stdin al traductor; ambas salidas se muestran en las
  pestañas de la derecha, en solo lectura.
- **Generar ejecutable**. Se habilita después de generar el NASM. Ejecuta `nasm -f elf32` y
  `ld -m elf_i386`, y descarga el binario `programa`.
- **Ejecutar**. Se habilita después de generar el ejecutable. Corre el programa con el texto de
  la pestaña "Entrada (stdin)" y muestra su salida en "Salida" (límite de 5 s).
- **Cargar ejemplo**: E/S, IF/ELSE anidado con `&&`/`||`, y FOR con WHILE.
- **Estado**: la barra inferior indica Validando, Generando, Ejecutando o Listo. Durante cada
  operación los botones quedan deshabilitados.

Si editas el código, los pasos ya hechos se invalidan y hay que volver a validar.

## Flujo de generación

| Invocación | Debe hacer |
|---|---|
| `bmlang < archivo.bml` | Validar. Imprime `Programa válido` y termina con exit 0, o reporta el error. |
| `bmlang archivo.bml` | Igual que la anterior, pero lee el archivo. |
| `bmlang --tac archivo.bml` | Imprimir solo el TAC por stdout y terminar con exit 0. |
| `tdc_nasm/tdc_nasm < programa.tac` | Leer TAC por stdin y emitir NASM x86 de 32 bits por stdout. |

- **Errores**: van por stderr con exit distinto de 0, en el mismo formato que la validación:
  `Error: <texto> en la linea N cerca de <token>`. El IDE los marca en el editor.
- **Orden de las fases**: el backend valida primero, luego genera TAC y finalmente lo envía por
  stdin a `tdc_nasm`. El NASM se conserva como salida stdout del traductor.
- **E/S del programa**: `READ` debe leer de stdin y `WRITE` escribir en stdout. "Ejecutar" pasa
  la pestaña "Entrada (stdin)" tal cual.

Las pruebas incluyen el flujo real del traductor y, por separado, un ejecutable auxiliar x86 de
32 bits y un generador falso para probar rutas del backend:

```bash
BMLANG_PATH=$PWD/backend/test/fixtures/generador_falso.sh npm run dev
```

## Formato del código de tres direcciones

Generado por las acciones de `compilador/bmlang.y` (aportado desde la rama `estructura`):

```text
main:
var $a;
t1 = 3 * 4;
t2 = 2 + t1;
$a = t2;
push $a;
call output;
```

- Las variables del usuario conservan `$`; los temporales son `t1`, `t2`…; las etiquetas, `l1`, `l2`…
- `var $a;` registra una declaración para el traductor a NASM.
- La potencia (`:`) es asociativa a la derecha. El menos unario se traduce como resta desde cero
  (`t1 = 0 - 2;`).
- Las comparaciones producen 1 o 0. `&&` y `||` generan saltos de cortocircuito.
- `goto l1;` es un salto incondicional; `ifZ t1 goto l1;` salta si es cero; `ifNZ` si es distinto de cero.
- `READ $a` → `call input;` + `pop $a;`. `WRITE $a` → `push $a;` + `call output;`.
- El TAC se acumula en un buffer de 1 MiB y solo se imprime si el análisis termina sin errores.
  Todavía no se comprueban variables duplicadas o sin declarar.

## API

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok, bmlangPath, mode }` o `{ ok: false, message }` |
| POST | `/api/check` | `{ code }` | `{ ok, errors: [{ line, message }], raw }` |
| POST | `/api/tac`, `/api/asm` | `{ code }` | `{ ok, output, errors }` (los errores pueden incluir `raw`) |
| POST | `/api/build` | `{ code }` | `{ ok, output, asm, fileName, executable (base64), errors }` |
| POST | `/api/run` | `{ code, stdin }` | `{ ok, output, exitCode, errors }` |

Códigos HTTP:

- 200: resultado normal, incluidos los errores del programa con `ok: false`.
- 400: falta `code`.
- 413: el código o el stdin supera 100 KB.
- 501: generador aún no implementado (`pending: true`).
- 503: binario o herramienta no disponible, con el mensaje en `errors`.

Robustez: cada petición usa su propio directorio temporal (`fs.mkdtemp`), que se borra al
terminar. Los procesos se lanzan con `spawn` y argumentos en arreglo, nunca con un shell. Hay un
timeout de 5 s y la salida capturada se limita a 100 KB.

## Limitaciones del analizador actual

- El detalle de los errores depende del mensaje genérico de Bison (el backend lo traduce a
  "error de sintaxis"). Cuando falta un `;`, la línea reportada es la del token siguiente,
  porque ahí detecta Bison el error.
- Por diseño del lexer, un comentario `#! … !#` debe cerrarse en la misma línea. Si no se
  cierra, el editor lo marca como inválido.
- Según la gramática, `WRITE` solo acepta una variable y no se permiten comentarios después del
  `}` final.
- El menos unario (`$a-1`, `-5`, `-$a`, `$b-(-2)`) está soportado. En la gramática del PDF
  equivale a `<factor>::= … | - <factor>`; ver `docs/propuesta-numeros-negativos.md`.
