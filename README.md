# BMLang

- `bmlang_tdc/`: analizador lexico y sintactico original. Aqui se agregara, paso a paso, la generacion de TDC mediante acciones en el `.y`.
- `tdc_nasm/`: carpeta reservada para el futuro traductor de TDC a NASM con `.l` y `.y`. Por ahora solo contiene `.gitkeep` para conservar la carpeta en Git.
- `ejemplos/`: programas fuente `.bml`.
- `docs/`: gramatica.

Los archivos C/H producidos por Flex y Bison y los ejecutables se generaran junto a sus fuentes y quedan excluidos de Git.
