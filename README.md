# BMLang

- `bmlang_tdc/`: analizador de BMLang y generador de codigo de tres direcciones mediante acciones en `bmlang.y`.
- `tdc_nasm/`: traductor del TDC a ensamblador NASM de Linux x86 de 32 bits, implementado en `.l` y `.y`.
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

El programa lee desde la entrada estandar y muestra el TDC en consola:

```sh
./bmlang_tdc/bmlang < ejemplos/entrada_valida.bml
```

Para guardarlo en un archivo `.tac`, se redirige la salida:

```sh
./bmlang_tdc/bmlang < ejemplos/entrada_valida.bml > programa.tac
```

Los errores se escriben en stderr con el mensaje, la linea y el texto cercano. El TDC se guarda en memoria hasta terminar el analisis: si falla, no se imprime codigo parcial. La redireccion `>` puede vaciar un archivo de salida anterior antes de ejecutar el programa.

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
- Cada comentario completo `#! ... !#` se reconoce como un unico token `COMENTARIO`, sin estados adicionales de Flex. Debe cerrar en la misma linea. Se aceptan comentarios vacios y varios en una linea, sin consumir las instrucciones que haya entre ellos. Una apertura sin cierre es un token invalido. Los comentarios no generan instrucciones TDC.

La implementacion usa un buffer de TDC de 1 MiB y valores de texto de hasta 127 caracteres (identificadores de hasta 126, para conservar el prefijo `$`). Si se supera un limite, se informa un error. Esta etapa reconoce la sintaxis y traduce las instrucciones; todavia no comprueba variables duplicadas o sin declaracion. No ensambla ni ejecuta los programas y no genera NASM.

## Traducir el TDC a NASM

El traductor reconoce el formato producido por `bmlang_tdc`: declaraciones, variables, temporales, asignaciones, aritmetica, potencia, comparaciones, etiquetas, saltos, lectura y escritura.

Desde la raiz del repositorio, compila la segunda etapa:

```sh
bison -d -o tdc_nasm/tdc_nasm.tab.c tdc_nasm/tdc_nasm.y
flex -o tdc_nasm/lex.yy.c tdc_nasm/tdc_nasm.l
gcc -Wall -Wextra -o tdc_nasm/tdc_nasm tdc_nasm/tdc_nasm.tab.c tdc_nasm/lex.yy.c
```

Genera ambos archivos de salida:

```sh
./bmlang_tdc/bmlang < ejemplos/entrada_valida.bml > tdc_nasm/programa.tac
./tdc_nasm/tdc_nasm < tdc_nasm/programa.tac > tdc_nasm/programa.asm
```

En Linux, con NASM, `ld` y soporte de ejecucion x86 de 32 bits:

```sh
nasm -f elf32 tdc_nasm/programa.asm -o tdc_nasm/programa.o
ld -m elf_i386 -o tdc_nasm/programa tdc_nasm/programa.o
./tdc_nasm/programa
```

El ejemplo incluido imprime 10 y despues los numeros de 0 a 4, uno por linea.

## Comportamiento del traductor

- Las variables `$nombre` y los temporales `t1`, `t2`, etc. se registran por separado. En NASM se nombran `bml_v0`, `bml_v1`, etc. para evitar conflictos con registros y palabras reservadas.
- Las declaraciones se recopilan de todo el TDC y tienen alcance global. Variables y temporales se reservan en `.bss` y empiezan en cero. Una declaracion puede aparecer despues de una referencia; debe existir en algun punto del archivo.
- Se rechazan declaraciones duplicadas, variables sin declarar, temporales usados sin ninguna asignacion, etiquetas duplicadas y saltos a etiquetas inexistentes. No se analiza si cada temporal esta inicializado en todos los caminos posibles.
- Cada operacion binaria carga sus operandos en registros, ejecuta la operacion y guarda el resultado en memoria.
- Las comparaciones usan enteros con signo y producen 1 o 0. `ifZ` e `ifNZ` generan saltos segun ese valor. Los saltos que ya contiene el TDC conservan el cortocircuito y el orden de los ciclos.
- `call input; pop ...;` se traduce como una lectura de entero. `push ...; call output;` se traduce como una escritura con salto de linea. Se reconocen esas parejas completas, tal como las genera la primera etapa; no se implementa una pila de llamadas general.
- Las rutinas de entrada, salida y errores se incluyen en el `.asm`. No se necesita una biblioteca externa de NASM ni enlazar con la biblioteca de C.
- La aritmetica trabaja con 32 bits. Suma, resta, multiplicacion y potencia conservan los 32 bits inferiores en caso de desbordamiento.
- La division trunca hacia cero. Una division por cero, `-2147483648 / -1`, un exponente negativo o una entrada invalida de `READ` muestran un error y terminan con codigo 1.
- El traductor admite la magnitud 2147483648 porque la primera etapa representa el minimo entero negativo mediante `0 - 2147483648`. Los valores fuera del intervalo de -2147483648 a 2147483648 se rechazan. El patron de bits 2147483648 representa -2147483648 en la maquina de 32 bits.
- `READ` acepta enteros de -2147483648 a 2147483647, separados por espacios o saltos de linea. `WRITE` imprime un entero por linea.
- El limite es de 4096 simbolos, 4096 etiquetas y 1 MiB de instrucciones NASM en memoria. Si hay un error de traduccion, no se imprime un ensamblador parcial.

La primera etapa genera `.tac`; la segunda genera `.asm`; NASM genera `.o` y `ld` crea el ejecutable. La pagina web sigue siendo una integracion posterior.
