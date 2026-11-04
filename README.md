# BMLang

- `bmlang_tdc/`: analizador de BMLang y generador de codigo de tres direcciones mediante acciones en `bmlang.y`.
- `tdc_nasm/`: carpeta reservada para construir el traductor de TDC a NASM con `.l` y `.y`. Por ahora solo contiene `.gitkeep`.
- `ejemplos/`: programas fuente `.bml`.
- `docs/`: gramatica.

Los archivos C/H producidos por Flex y Bison y los ejecutables se generan junto a sus fuentes y quedan excluidos de Git. No hay modulos manuales `.c` o `.h` para la generacion.

## Compilar en Linux

Desde la raiz del repositorio, con Bison, Flex y GCC instalados:

```sh
bison -d -o bmlang_tdc/bmlang.tab.c bmlang_tdc/bmlang.y
flex -o bmlang_tdc/lex.yy.c bmlang_tdc/bmlang.l
gcc -Wall -Wextra -o bmlang_tdc/bmlang bmlang_tdc/bmlang.tab.c bmlang_tdc/lex.yy.c
```

## Generar el TDC

Para leer un `.bml` y guardar la traduccion en un `.tac`:

```sh
./bmlang_tdc/bmlang ejemplos/entrada_valida.bml programa.tac
```

Para imprimir el TDC en consola:

```sh
./bmlang_tdc/bmlang ejemplos/entrada_valida.bml
```

Tambien se puede usar entrada estandar y redireccionar la salida:

```sh
./bmlang_tdc/bmlang < ejemplos/entrada_valida.bml > programa.tac
```

Los mensajes de diagnostico se escriben en stderr. El TDC se guarda en memoria hasta terminar el analisis: si la sintaxis falla, no se entrega codigo parcial. Con el argumento de salida explicito, un error de analisis conserva el archivo de salida anterior. Una redireccion del shell (`>`) si puede vaciarlo antes de ejecutar el compilador.

## Formato del TDC

```text
main:
var $a;
t1 = 3 * 4;
t2 = 2 + t1;
$a = t2;
push $a;
call output;
```

- Se conserva `$` en las variables del usuario para distinguirlas de temporales como `t1`.
- `var $a;` registra una declaracion para el futuro traductor a NASM.
- Los temporales se llaman `t1`, `t2`, etc. Las etiquetas se llaman `l1`, `l2`, etc.
- Se generan asignaciones, operaciones aritmeticas, potencia, comparaciones, `IF/ELSE`, `WHILE`, `FOR`, `READ` y `WRITE`.
- La potencia mantiene la asociatividad a la derecha. La resta reconoce entradas sin espacios, como `5-1`. El signo negativo se resuelve en el `.y` mediante una resta desde cero.
- `&&` y `||` generan saltos de cortocircuito. Una comparacion produce 1 o 0.
- `goto l1;` es un salto incondicional. `ifZ t1 goto l1;` salta si el valor es cero; `ifNZ` salta si es distinto de cero.
- `READ` se representa con `call input;` y `pop $variable;`. `WRITE` usa `push $variable;` y `call output;`.
- Los comentarios `#! ... !#` se reconocen, pero no generan instrucciones.

La implementacion usa un buffer de TDC de 1 MiB y valores de texto de hasta 127 caracteres (identificadores de hasta 126, para conservar el prefijo `$`). Si se supera un limite, se informa un error. Esta etapa reconoce la sintaxis y traduce las instrucciones; todavia no comprueba variables duplicadas o sin declaracion. No ensambla ni ejecuta los programas y no genera NASM.
