%{
#include <stdio.h>
#include <string.h>
#include <stdarg.h>

int yylex(void);
void yyerror(const char *mensaje);
void nuevaTemp(char *temporal);
int nuevaEtiqueta(void);
void emitir(const char *formato, ...);
void escribirEtiqueta(int etiqueta);

static char codigoTDC[1024 * 1024];
static size_t longitudTDC = 0;
static int siguienteTemporal = 1;
static int siguienteEtiqueta = 1;
static int errorEscritura = 0;
%}

%union {
    char cadena[128];
    struct {
        int inicio, fin, incremento, cuerpo;
    } control;
    struct {
        char temporal[128];
        int fin;
    } salto;
}

%token <cadena> ID NUMERO
%token COMENTARIO
%token MAIN INI_LLAVE FIN_LLAVE DEC COMA READ WRITE IF ELSE WHILE FOR INI_PAREN FIN_PAREN PYC AND OR IGUAL DIFERENTE MENOR MAYOR MENOR_IGUAL MAYOR_IGUAL MENOR_MAYOR ASIGNACION SIMBOLO_VARIABLE SUMA RESTA MULTIPLICACION DIVISION DOS_PUNTOS INVALIDO
%type <cadena> variable expresion termino potencia factor cond_or cond_and condicion comparador

%%
programa: lista_comentarios MAIN INI_LLAVE lista_sent FIN_LLAVE
;

lista_comentarios: comentario lista_comentarios | vacio
;

lista_sent: sentencia lista_sent | vacio
;

sentencia: declaracion PYC | asignacion PYC | lectura PYC | escritura PYC | bloque_if | bloque_while | bloque_for | comentario
;

declaracion: DEC variable { emitir("var %s;\n", $2); } otra_variable
;

otra_variable: COMA variable { emitir("var %s;\n", $2); } otra_variable | vacio
;

asignacion: variable ASIGNACION expresion { emitir("%s = %s;\n", $1, $3); }
;

lectura: READ variable { emitir("call input;\npop %s;\n", $2); }
;

escritura: WRITE variable { emitir("push %s;\ncall output;\n", $2); }
;

expresion: expresion SUMA termino {
    nuevaTemp($$); emitir("%s = %s + %s;\n", $$, $1, $3);
}
| expresion RESTA termino {
    nuevaTemp($$); emitir("%s = %s - %s;\n", $$, $1, $3);
}
| termino { strcpy($$, $1); }
;

termino: termino MULTIPLICACION potencia {
    nuevaTemp($$); emitir("%s = %s * %s;\n", $$, $1, $3);
}
| termino DIVISION potencia {
    nuevaTemp($$); emitir("%s = %s / %s;\n", $$, $1, $3);
}
| potencia { strcpy($$, $1); }
;

potencia: factor DOS_PUNTOS potencia {
    nuevaTemp($$); emitir("%s = %s : %s;\n", $$, $1, $3);
}
| factor { strcpy($$, $1); }
;

factor: INI_PAREN expresion FIN_PAREN { strcpy($$, $2); }
| NUMERO { strcpy($$, $1); }
| variable { strcpy($$, $1); }
| RESTA factor { nuevaTemp($$); emitir("%s = 0 - %s;\n", $$, $2); }
;

bloque_if: IF INI_PAREN cond_or FIN_PAREN {
    $<control>$.inicio = nuevaEtiqueta();
    $<control>$.fin = nuevaEtiqueta();
    emitir("ifZ %s goto l%d;\n", $3, $<control>$.inicio);
}
INI_LLAVE lista_sent FIN_LLAVE {
    emitir("goto l%d;\n", $<control>5.fin);
    escribirEtiqueta($<control>5.inicio);
}
parte_else { escribirEtiqueta($<control>5.fin); }
;

parte_else: ELSE INI_LLAVE lista_sent FIN_LLAVE | vacio
;

bloque_while: WHILE INI_PAREN {
    $<control>$.inicio = nuevaEtiqueta();
    $<control>$.fin = nuevaEtiqueta();
    escribirEtiqueta($<control>$.inicio);
}
cond_or FIN_PAREN {
    emitir("ifZ %s goto l%d;\n", $4, $<control>3.fin);
}
INI_LLAVE lista_sent FIN_LLAVE {
    emitir("goto l%d;\n", $<control>3.inicio);
    escribirEtiqueta($<control>3.fin);
}
;

bloque_for: FOR INI_PAREN asignacion PYC {
    $<control>$.inicio = nuevaEtiqueta();
    $<control>$.fin = nuevaEtiqueta();
    $<control>$.incremento = nuevaEtiqueta();
    $<control>$.cuerpo = nuevaEtiqueta();
    escribirEtiqueta($<control>$.inicio);
}
cond_or PYC {
    emitir("ifZ %s goto l%d;\n", $6, $<control>5.fin);
    emitir("goto l%d;\n", $<control>5.cuerpo);
    escribirEtiqueta($<control>5.incremento);
}
asignacion FIN_PAREN {
    emitir("goto l%d;\n", $<control>5.inicio);
    escribirEtiqueta($<control>5.cuerpo);
}
INI_LLAVE lista_sent FIN_LLAVE {
    emitir("goto l%d;\n", $<control>5.incremento);
    escribirEtiqueta($<control>5.fin);
}
;

cond_or: cond_or OR {
    nuevaTemp($<salto>$.temporal);
    $<salto>$.fin = nuevaEtiqueta();
    emitir("%s = 1;\n", $<salto>$.temporal);
    emitir("ifNZ %s goto l%d;\n", $1, $<salto>$.fin);
}
cond_and {
    emitir("%s = %s <> 0;\n", $<salto>3.temporal, $4);
    escribirEtiqueta($<salto>3.fin);
    strcpy($$, $<salto>3.temporal);
}
| cond_and { strcpy($$, $1); }
;

cond_and: cond_and AND {
    nuevaTemp($<salto>$.temporal);
    $<salto>$.fin = nuevaEtiqueta();
    emitir("%s = 0;\n", $<salto>$.temporal);
    emitir("ifZ %s goto l%d;\n", $1, $<salto>$.fin);
}
condicion {
    emitir("%s = %s <> 0;\n", $<salto>3.temporal, $4);
    escribirEtiqueta($<salto>3.fin);
    strcpy($$, $<salto>3.temporal);
}
| condicion { strcpy($$, $1); }
;

condicion: expresion comparador expresion {
    nuevaTemp($$); emitir("%s = %s %s %s;\n", $$, $1, $2, $3);
}
;

comparador: IGUAL { strcpy($$, "=="); }
| DIFERENTE { strcpy($$, "<>"); }
| MENOR_MAYOR { strcpy($$, "<>"); }
| MENOR { strcpy($$, "<"); }
| MAYOR { strcpy($$, ">"); }
| MENOR_IGUAL { strcpy($$, "<="); }
| MAYOR_IGUAL { strcpy($$, ">="); }
;

variable: SIMBOLO_VARIABLE ID {
    $$[0] = '$'; strcpy($$ + 1, $2);
}
;

comentario: COMENTARIO
;

vacio:
;
%%

void nuevaTemp(char *temporal) {
    sprintf(temporal, "t%d", siguienteTemporal++);
}

int nuevaEtiqueta(void) {
    return siguienteEtiqueta++;
}

void emitir(const char *formato, ...) {
    va_list argumentos;
    int escritos;
    size_t disponible = sizeof(codigoTDC) - longitudTDC;
    if (errorEscritura) return;
    va_start(argumentos, formato);
    escritos = vsnprintf(codigoTDC + longitudTDC, disponible, formato, argumentos);
    va_end(argumentos);
    if (escritos < 0 || (size_t)escritos >= disponible) {
        errorEscritura = 1;
        return;
    }
    longitudTDC += (size_t)escritos;
}

void escribirEtiqueta(int etiqueta) {
    emitir("l%d:\n", etiqueta);
}

/*
 * Uso: bmlang [--tac | --asm] [archivo.bml]   (sin archivo lee de stdin)
 *   sin opcion: solo valida e imprime "Programa válido".
 *   --tac:      imprime el codigo de tres direcciones.
 *   --asm:      lo implementara el traductor de tdc_nasm/; mientras tanto responde
 *               "opcion no soportada" (exit 2) y el IDE muestra "Generador aún no implementado".
 */
int main(int argc, char **argv) {
    extern FILE *yyin;
    const char *archivo = NULL;
    int generarTDC = 0;
    int resultado;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--tac") == 0) {
            generarTDC = 1;
        } else if (strncmp(argv[i], "--", 2) == 0) {
            fprintf(stderr, "Error: opcion no soportada: %s\n", argv[i]);
            return 2;
        } else {
            archivo = argv[i];
        }
    }
    if (archivo != NULL && (yyin = fopen(archivo, "r")) == NULL) {
        fprintf(stderr, "Error: no se pudo abrir %s\n", archivo);
        return 2;
    }

    emitir("main:\n");
    resultado = yyparse();

    if (resultado != 0) {
        return resultado;
    }

    if (errorEscritura) {
        fprintf(stderr, "Error al generar el TDC\n");
        return 1;
    }

    if (generarTDC) {
        printf("%s", codigoTDC);
    } else {
        printf("Programa válido\n");
    }
    return 0;
}

void yyerror(const char *mensaje) {
    extern int yylineno;
    extern char *yytext;
    extern int linea_comentario;

    if (yychar == INVALIDO && linea_comentario != 0) {
        fprintf(stderr, "Error: comentario sin cerrar en la linea %d cerca de #!; se esperaba !# antes del fin de linea\n", linea_comentario);
        return;
    }
    fprintf(stderr, "Error: %s en la linea %d cerca de %s\n", mensaje, yylineno, yytext);
}
