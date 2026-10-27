# Propuesta: reportar el número de línea en los errores

**Estado: NO aplicada.** `compilador/bmlang.l` y `compilador/bmlang.y` no se han modificado.

Hoy `yyerror` imprime solo `Error: syntax error` (stderr, exit 1), sin línea, así que el IDE
muestra el error pero no puede marcarlo en el editor. El adaptador del backend
(`backend/src/compiler/parseCompilerOutput.js`) ya entiende el formato `Error línea N: texto`,
así que con este cambio el IDE marcará la línea sin tocar nada más.

## Cambio mínimo

`bmlang.l` — agregar una línea debajo de `%option noyywrap`:

```diff
 %option noyywrap
+%option yylineno
```

`bmlang.y` — declarar `yylineno` e incluirlo en el mensaje:

```diff
 int yylex(void);
 void yyerror(const char *mensaje);
+extern int yylineno;
 %}
+
+%define parse.error verbose
```

```diff
 void yyerror(const char *mensaje)
 {
-    fprintf(stderr, "Error: %s\n", mensaje);
+    fprintf(stderr, "Error línea %d: %s\n", yylineno, mensaje);
 }
```

`%define parse.error verbose` (Bison 3) es opcional: cambia `syntax error` por
`syntax error, unexpected WRITE, expecting PYC`, mucho más útil en el IDE.

Nota: Bison detecta el error en el *siguiente* token. Si falta `;` al final de la línea 3,
el error se reporta en la línea donde empieza la siguiente sentencia (p. ej. la 4).

## Recompilar (WSL / Linux)

```bash
sudo apt-get install -y bison flex gcc
cd compilador
bison -d bmlang.y && flex bmlang.l && gcc bmlang.tab.c lex.yy.c -o bmlang
```

No hace falta `-lfl`: con `%option noyywrap` y `main` definido en `bmlang.y`, la librería de
Flex no se usa. El binario actual sí fue enlazado con `-lfl` y por eso falla en una
instalación de WSL sin `libfl2`.
