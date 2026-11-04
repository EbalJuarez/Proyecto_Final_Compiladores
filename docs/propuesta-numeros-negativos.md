# Propuesta: aceptar `$a-1` (resta sin espacios)

**Estado: NO aplicada.** `compilador/bmlang.l` y `compilador/bmlang.y` no se han modificado.

## Problema

El lexer reconoce los números con `-?[0-9]+`. Flex toma siempre la coincidencia más larga, así
que en `$a => $a-1;` el texto `-1` se lee como un solo `NUMERO` y el parser recibe
`variable NUMERO`, que no es válido:

```
Error: syntax error en la linea 3 cerca de -1
```

Con espacios (`$a - 1`) sí funciona. Tampoco se puede negar una variable (`-$a`).

## Cambio mínimo

`bmlang.l`: el número deja de incluir el signo.

```diff
--?[0-9]+                 { return NUMERO; }
+[0-9]+                   { return NUMERO; }
```

`bmlang.y`: el signo pasa a ser un menos unario en `factor`.

```diff
-factor: INI_PAREN expresion FIN_PAREN | NUMERO | variable
+factor: INI_PAREN expresion FIN_PAREN | NUMERO | variable | RESTA factor
```

En la gramática del PDF equivale a agregar `| - <factor>` a `<factor>`.

## Verificación (en una copia, sin tocar los originales)

Bison no reporta conflictos y todos estos casos dan `Programa válido`:

| Entrada | Antes | Después |
|---|---|---|
| `$a => $a-1;` | error | válido |
| `$a => $a -1;` | error | válido |
| `$a => -5;` | válido | válido |
| `$a => -$a;` | error | válido |
| `$a => $a - -1;` | válido | válido |
| `$a => 2 * -(3 + $a);` | error | válido |
| `IF ($a > -1) { WRITE $a; }` | válido | válido |

`ejemplos/entrada_valida.bml` y los ejemplos del IDE siguen siendo válidos.
