%{
#include <stdio.h>
#include <string.h>
#include "tdc_nasm.tab.h"
%}

%option yylineno noyywrap

%%
"main"                     { return MAIN; }
"var"                      { return VAR; }
"goto"                     { return GOTO; }
"ifZ"                      { return IFZ; }
"ifNZ"                     { return IFNZ; }
"call"                     { return CALL; }
"input"                    { return INPUT; }
"output"                   { return OUTPUT; }
"push"                     { return PUSH; }
"pop"                      { return POP; }
":"                        { return DOS_PUNTOS; }
"="                        { return IGUAL; }
";"                        { return PYC; }
"-"                        { return RESTA; }
"+"|"*"|"/"|"=="|"<>"|"!="|"<="|">="|"<"|">" {
    strcpy(yylval.cadena, yytext);
    return OPERADOR;
}
\$[a-zA-Z_][a-zA-Z0-9_]*   {
    if ((size_t)yyleng >= sizeof(yylval.cadena)) return INVALIDO;
    strcpy(yylval.cadena, yytext);
    return VARIABLE;
}
t[0-9]+                    {
    if ((size_t)yyleng >= sizeof(yylval.cadena)) return INVALIDO;
    strcpy(yylval.cadena, yytext);
    return TEMPORAL;
}
l[0-9]+                    {
    if ((size_t)yyleng >= sizeof(yylval.cadena)) return INVALIDO;
    strcpy(yylval.cadena, yytext);
    return ETIQUETA;
}
[0-9]+                     {
    if ((size_t)yyleng >= sizeof(yylval.cadena)) return INVALIDO;
    strcpy(yylval.cadena, yytext);
    return NUMERO;
}
[ \t\r\n]+                { }
.                          { return INVALIDO; }
%%
