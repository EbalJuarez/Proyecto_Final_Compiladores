%{
#include <stdio.h>
#include <string.h>
#include "bmlang.tab.h"

/* Linea inicial de un comentario pendiente de cierre. */
int linea_comentario = 0;
%}

%option yylineno noyywrap
%x CUERPO_COMENTARIO FIN_COMENTARIO

%%

"#!"                              { linea_comentario = yylineno; BEGIN(CUERPO_COMENTARIO); return INICIO_COMENTARIO; }
<CUERPO_COMENTARIO>"!#"           { yyless(yyleng - 2); BEGIN(FIN_COMENTARIO); return COMENTARIO; }
<CUERPO_COMENTARIO>[^!\n]+        { yymore(); }
<CUERPO_COMENTARIO>"!"            { yymore(); }
<CUERPO_COMENTARIO>\n             { BEGIN(INITIAL); return INVALIDO; }
<CUERPO_COMENTARIO><<EOF>>        { BEGIN(INITIAL); return INVALIDO; }
<FIN_COMENTARIO>"!#"              { linea_comentario = 0; BEGIN(INITIAL); return CIERRE_COMENTARIO; }

"MAIN"          { return MAIN; }
"DEC"           { return DEC; }
"READ"          { return READ; }
"WRITE"         { return WRITE; }
"IF"            { return IF; }
"ELSE"          { return ELSE; }
"WHILE"         { return WHILE; }
"FOR"           { return FOR; }
"{"             { return INI_LLAVE; }
"}"             { return FIN_LLAVE; }
"("             { return INI_PAREN; }
")"             { return FIN_PAREN; }
";"             { return PYC; }
","             { return COMA; }
":"             { return DOS_PUNTOS; }
"<="            { return MENOR_IGUAL; }
"=="            { return IGUAL; }
"!="            { return DIFERENTE; }
"<>"            { return MENOR_MAYOR; }
"=>"            { return ASIGNACION; }
">="            { return MAYOR_IGUAL; }
"<"             { return MENOR; }
">"             { return MAYOR; }
"&&"            { return AND; }
"||"            { return OR; }
"+"             { return SUMA; }
"-"             { return RESTA; }
"*"             { return MULTIPLICACION; }
"/"             { return DIVISION; }
"$"             { return SIMBOLO_VARIABLE; }
[a-zA-Z_][a-zA-Z0-9_]*   {
    if ((size_t)yyleng + 1 >= sizeof(yylval.cadena)) {
        return INVALIDO;
    }
    strcpy(yylval.cadena, yytext);
    return ID;
}
[0-9]+                 {
    if ((size_t)yyleng >= sizeof(yylval.cadena)) {
        return INVALIDO;
    }
    strcpy(yylval.cadena, yytext);
    return NUMERO;
}
\n                      { /* ignorar salto de línea */ }
[ \t\r]+                { /* ignorar espacios */ }
.                       { return INVALIDO; }

%%

