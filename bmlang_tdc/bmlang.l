%{
#include <stdio.h>
#include <string.h>
#include "bmlang.tab.h"
%}

%option yylineno noyywrap

%%

"#!"([^!\n]|!+[^!#\n])*!+"#"    { return COMENTARIO; }
"#!"                              { return INVALIDO; }

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
\n                      {  }
[ \t\r]+                {  }
.                       { return INVALIDO; }

%%
