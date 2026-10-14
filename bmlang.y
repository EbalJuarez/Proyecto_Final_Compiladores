%{
#include <stdio.h>

int yylex(void);
void yyerror(const char *mensaje);
%}

%token MAIN INI_LLAVE FIN_LLAVE DEC COMA READ WRITE IF ELSE WHILE FOR INI_PAREN FIN_PAREN PYC AND OR IGUAL DIFERENTE MENOR MAYOR MENOR_IGUAL MAYOR_IGUAL MENOR_MAYOR ASIGNACION SIMBOLO_VARIABLE ID NUMERO SUMA RESTA MULTIPLICACION DIVISION DOS_PUNTOS EOL INVALIDO

%%
programa:MAIN INI_LLAVE lista_sent FIN_LLAVE {printf("Programa válido\n");}
;

lista_sent:sentencia lista_sent | vacio
;

sentencia: declaracion PYC | asignacion PYC | lectura PYC | escritura PYC | bloque_if | bloque_while | bloque_for
;

declaracion: DEC variable otra_variable
;

otra_variable: COMA variable otra_variable | vacio
;

asignacion: variable ASIGNACION expresion
;

lectura: READ variable
;

escritura: WRITE variable
;

expresion: expresion SUMA termino | expresion RESTA termino | termino
;

termino: termino MULTIPLICACION potencia | termino DIVISION potencia | potencia
;

potencia: factor DOS_PUNTOS potencia | factor
;

factor: INI_PAREN expresion FIN_PAREN | NUMERO | variable
;

bloque_if: IF INI_PAREN cond_or FIN_PAREN INI_LLAVE lista_sent FIN_LLAVE parte_else
;

parte_else: ELSE INI_LLAVE lista_sent FIN_LLAVE | vacio
;

bloque_while: WHILE INI_PAREN cond_or FIN_PAREN INI_LLAVE lista_sent FIN_LLAVE
;

bloque_for: FOR INI_PAREN asignacion PYC cond_or PYC asignacion FIN_PAREN INI_LLAVE lista_sent FIN_LLAVE
;

cond_or: cond_and OR cond_and | cond_and
;

cond_and:
    cond_and AND condicion
  | condicion
;

condicion: expresion comparador expresion
;

comparador: IGUAL | DIFERENTE | MENOR | MAYOR | MAYOR_IGUAL | MENOR_IGUAL | MENOR_MAYOR
;

variable: SIMBOLO_VARIABLE ID
;

vacio: /* vacio */
;

%%

int main(void)
{
    return yyparse();
}

void yyerror(const char *mensaje) {
    extern int yylineno;
    extern char* yytext;
    fprintf(stderr, "Error: %s en la linea %i cerca de %s\n", mensaje, yylineno, yytext);
}