// Programas de ejemplo escritos con la gramática real de bmlang.y:
// asignación con "=>", potencia con ":", READ/WRITE solo con variables.
export const EXAMPLES = [
  {
    id: 'io',
    name: 'Lectura y escritura',
    description: 'READ / WRITE y expresiones aritméticas',
    code: `MAIN {
    DEC $base, $altura, $area, $cubo;
    READ $base;
    READ $altura;
    $area => $base * $altura / 2;
    $cubo => $base : 3;
    WRITE $area;
    WRITE $cubo;
}
`,
  },
  {
    id: 'if',
    name: 'IF / ELSE anidado',
    description: 'Condiciones con && y ||',
    code: `MAIN {
    DEC $nota, $extra, $resultado;
    READ $nota;
    READ $extra;
    IF ($nota >= 61 && $extra >= 0) {
        IF ($nota + $extra > 90) {
            $resultado => 3;
        } ELSE {
            $resultado => 2;
        }
    } ELSE {
        IF ($nota < 0 || $nota > 100) {
            $resultado => 0;
        } ELSE {
            $resultado => 1;
        }
    }
    WRITE $resultado;
}
`,
  },
  {
    id: 'loops',
    name: 'FOR y WHILE',
    description: 'Ciclos con contador y acumulador',
    code: `MAIN {
    DEC $i, $n, $suma, $fact;
    READ $n;
    $suma => 0;
    FOR ($i => 1; $i <= $n; $i => $i + 1) {
        $suma => $suma + $i;
    }
    WRITE $suma;
    $fact => 1;
    WHILE ($n > 1) {
        $fact => $fact * $n;
        $n => $n - 1;
    }
    WRITE $fact;
}
`,
  },
];

export const DEFAULT_CODE = EXAMPLES[0].code;
