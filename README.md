# BMLang

## Carpetas

- `compilador/`: fuentes Flex/Bison (`bmlang.l` y `bmlang.y`), archivos C/H generados y ejecutable del compilador. Los archivos generados y binarios se excluyen de Git.
- `generacion/`: módulos de código intermedio y ensamblador NASM.
- `ejemplos/`: programas fuente con extensión `.bml`.
- `docs/`: gramática y documentación.
- `salida/`: código intermedio, NASM y ejecutables producidos por el compilador; excluida de Git.

## Compilar y probar

Desde la raíz del proyecto, con Flex, Bison y GCC disponibles:

```sh
bison -d -o compilador/bmlang.tab.c compilador/bmlang.y
flex -o compilador/lex.yy.c compilador/bmlang.l
gcc -Icompilador -o compilador/bmlang compilador/bmlang.tab.c compilador/lex.yy.c
./compilador/bmlang < ejemplos/entrada_valida.bml
```

Por ahora, el programa valida la sintaxis. La generación de código intermedio y NASM aún no está implementada.
