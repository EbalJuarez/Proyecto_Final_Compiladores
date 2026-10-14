%{
#include <stdio.h>
#include "bmlang.tab.h"
%}

%option yylineno

%%

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
[a-zA-Z_][a-zA-Z0-9_]*   { return ID; }
-?[0-9]+                 { return NUMERO; }
\n                      { /* ignorar salto de línea */ }
[ \t\r]+                { /* ignorar espacios */ }
.                       { return INVALIDO; }

%%

