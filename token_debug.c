#include <stdio.h>
#include <string.h>
#include "bmlang.tab.h"
extern FILE *yyin;
extern char *yytext;
int yylex(void);
int main(void){
    yyin = fopen("entrada_valida.txt", "r");
    int tok;
    if (!yyin) { perror("fopen"); return 1; }
    while ((tok = yylex()) != 0) {
        printf("TOK=%d TEXT='%s'\n", tok, yytext);
    }
    fclose(yyin);
    return 0;
}
