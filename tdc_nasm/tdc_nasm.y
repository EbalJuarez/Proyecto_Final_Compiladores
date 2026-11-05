%{
#include <stdio.h>
#include <string.h>
#include <stdarg.h>

int yylex(void);
void yyerror(const char *mensaje);
int buscarSimbolo(const char *nombre);
int registrarSimbolo(const char *nombre);
int declararVariable(const char *nombre);
int registrarEtiqueta(const char *nombre, int definir);
int validarSimbolos(void);
int numeroValido(const char *texto);
int emitir(const char *formato, ...);
int agregarOperacion(int destino, const char *a, const char *op, const char *b);
void escribirRutinas(void);

static char simbolos[4096][128];
static int declarados[4096];
static int definidos[4096];
static int usados[4096];
static int cantidadSimbolos = 0;
static char etiquetas[4096][128];
static int etiquetasDefinidas[4096];
static int cantidadEtiquetas = 0;
static char codigo[1024 * 1024];
static size_t longitudCodigo = 0;
static int siguienteOperacion = 1;
%}

%union {
    char cadena[128];
    int indice;
}

%token MAIN VAR DOS_PUNTOS IGUAL PYC INVALIDO RESTA
%token GOTO IFZ IFNZ CALL INPUT OUTPUT PUSH POP
%token <cadena> VARIABLE TEMPORAL ETIQUETA NUMERO OPERADOR
%type <cadena> valor operador
%type <indice> referencia

%%
programa: MAIN DOS_PUNTOS lista_instrucciones
;

lista_instrucciones: instruccion lista_instrucciones | vacio
;

instruccion: declaracion | asignacion | marca | salto | lectura | escritura
;

declaracion: VAR VARIABLE PYC {
    if (!declararVariable($2)) YYABORT;
}
;

referencia: VARIABLE {
    $$ = registrarSimbolo($1);
    if ($$ < 0) YYABORT;
}
| TEMPORAL {
    $$ = registrarSimbolo($1);
    if ($$ < 0) YYABORT;
}
;

asignacion: referencia IGUAL valor PYC {
    definidos[$1] = 1;
    if (!emitir("    mov eax, %s\n    mov [bml_v%d], eax\n", $3, $1)) YYABORT;
}
| referencia IGUAL valor operador valor PYC {
    definidos[$1] = 1;
    if (!agregarOperacion($1, $3, $4, $5)) YYABORT;
}
;

valor: NUMERO {
    if (!numeroValido($1)) { yyerror("numero fuera del rango de 32 bits"); YYABORT; }
    strcpy($$, $1);
}
| RESTA NUMERO {
    if (strlen($2) + 1 >= sizeof($$)) { yyerror("numero demasiado largo"); YYABORT; }
    $$[0] = '-'; strcpy($$ + 1, $2);
    if (!numeroValido($$)) { yyerror("numero fuera del rango de 32 bits"); YYABORT; }
}
| referencia {
    usados[$1] = 1;
    sprintf($$, "[bml_v%d]", $1);
}
;

operador: OPERADOR { strcpy($$, $1); }
| RESTA { strcpy($$, "-"); }
| DOS_PUNTOS { strcpy($$, ":"); }
;

marca: ETIQUETA DOS_PUNTOS {
    if (!registrarEtiqueta($1, 1)) YYABORT;
    if (!emitir("bml_%s:\n", $1)) YYABORT;
}
;

salto: GOTO ETIQUETA PYC {
    if (!registrarEtiqueta($2, 0)) YYABORT;
    if (!emitir("    jmp bml_%s\n", $2)) YYABORT;
}
| IFZ valor GOTO ETIQUETA PYC {
    if (!registrarEtiqueta($4, 0)) YYABORT;
    if (!emitir("    mov eax, %s\n    test eax, eax\n    jz bml_%s\n", $2, $4)) YYABORT;
}
| IFNZ valor GOTO ETIQUETA PYC {
    if (!registrarEtiqueta($4, 0)) YYABORT;
    if (!emitir("    mov eax, %s\n    test eax, eax\n    jnz bml_%s\n", $2, $4)) YYABORT;
}
;

lectura: CALL INPUT PYC POP referencia PYC {
    definidos[$5] = 1;
    if (!emitir("    call bml_input\n    mov [bml_v%d], eax\n", $5)) YYABORT;
}
;

escritura: PUSH valor PYC CALL OUTPUT PYC {
    if (!emitir("    mov eax, %s\n    call bml_output\n", $2)) YYABORT;
}
;

vacio:
;
%%

int buscarSimbolo(const char *nombre) {
    int i;
    for (i = 0; i < cantidadSimbolos; i++) {
        if (strcmp(simbolos[i], nombre) == 0) return i;
    }
    return -1;
}

int registrarSimbolo(const char *nombre) {
    int indice = buscarSimbolo(nombre);
    if (indice >= 0) return indice;
    if (cantidadSimbolos >= 4096) { yyerror("demasiadas variables o temporales"); return -1; }
    strcpy(simbolos[cantidadSimbolos], nombre);
    return cantidadSimbolos++;
}

int declararVariable(const char *nombre) {
    int indice = registrarSimbolo(nombre);
    if (indice < 0) return 0;
    if (declarados[indice]) { yyerror("variable declarada mas de una vez"); return 0; }
    declarados[indice] = 1;
    return 1;
}

int registrarEtiqueta(const char *nombre, int definir) {
    int i;
    for (i = 0; i < cantidadEtiquetas; i++) {
        if (strcmp(etiquetas[i], nombre) == 0) break;
    }
    if (i == cantidadEtiquetas) {
        if (cantidadEtiquetas >= 4096) { yyerror("demasiadas etiquetas"); return 0; }
        strcpy(etiquetas[cantidadEtiquetas++], nombre);
    }
    if (definir && etiquetasDefinidas[i]) { yyerror("etiqueta definida mas de una vez"); return 0; }
    if (definir) etiquetasDefinidas[i] = 1;
    return 1;
}

int validarSimbolos(void) {
    int i;
    char mensaje[256];
    for (i = 0; i < cantidadSimbolos; i++) {
        if (simbolos[i][0] == '$' && !declarados[i]) {
            sprintf(mensaje, "variable no declarada: %s", simbolos[i]);
            yyerror(mensaje); return 0;
        }
        if (simbolos[i][0] == 't' && usados[i] && !definidos[i]) {
            sprintf(mensaje, "temporal sin asignacion: %s", simbolos[i]);
            yyerror(mensaje); return 0;
        }
    }
    for (i = 0; i < cantidadEtiquetas; i++) {
        if (!etiquetasDefinidas[i]) {
            sprintf(mensaje, "etiqueta sin definir: %s", etiquetas[i]);
            yyerror(mensaje); return 0;
        }
    }
    return 1;
}

int numeroValido(const char *texto) {
    unsigned long valor = 0;
    unsigned long limite = 2147483648UL;
    if (*texto == '-') texto++;
    while (*texto) {
        unsigned long digito = (unsigned long)(*texto - '0');
        if (valor > (limite - digito) / 10) return 0;
        valor = valor * 10 + digito;
        texto++;
    }
    return 1;
}

int emitir(const char *formato, ...) {
    va_list argumentos;
    int escritos;
    size_t disponible = sizeof(codigo) - longitudCodigo;
    va_start(argumentos, formato);
    escritos = vsnprintf(codigo + longitudCodigo, disponible, formato, argumentos);
    va_end(argumentos);
    if (escritos < 0 || (size_t)escritos >= disponible) {
        yyerror("el codigo generado supera el limite de 1 MiB"); return 0;
    }
    longitudCodigo += (size_t)escritos;
    return 1;
}

int agregarOperacion(int destino, const char *a, const char *op, const char *b) {
    int numero = siguienteOperacion++;
    const char *comparacion = NULL;
    if (!emitir("    mov eax, %s\n    mov ebx, %s\n", a, b)) return 0;
    if (strcmp(op, "==") == 0) comparacion = "sete";
    else if (strcmp(op, "<>") == 0 || strcmp(op, "!=") == 0) comparacion = "setne";
    else if (strcmp(op, "<") == 0) comparacion = "setl";
    else if (strcmp(op, ">") == 0) comparacion = "setg";
    else if (strcmp(op, "<=") == 0) comparacion = "setle";
    else if (strcmp(op, ">=") == 0) comparacion = "setge";
    if (comparacion) {
        if (!emitir("    cmp eax, ebx\n    %s al\n    movzx eax, al\n", comparacion)) return 0;
    } else if (strcmp(op, "+") == 0) {
        if (!emitir("    add eax, ebx\n")) return 0;
    } else if (strcmp(op, "-") == 0) {
        if (!emitir("    sub eax, ebx\n")) return 0;
    } else if (strcmp(op, "*") == 0) {
        if (!emitir("    imul eax, ebx\n")) return 0;
    } else if (strcmp(op, "/") == 0) {
        if (!emitir("    test ebx, ebx\n    jz bml_error_division\n"
            "    cmp eax, 0x80000000\n    jne bml_div_ok_%d\n"
            "    cmp ebx, -1\n    je bml_error_division\nbml_div_ok_%d:\n"
            "    cdq\n    idiv ebx\n", numero, numero)) return 0;
    } else if (strcmp(op, ":") == 0) {
        if (!emitir("    test ebx, ebx\n    js bml_error_exponent\n"
            "    mov ecx, ebx\n    mov ebx, eax\n    mov eax, 1\n"
            "bml_pow_loop_%d:\n    test ecx, ecx\n    jz bml_pow_end_%d\n"
            "    test ecx, 1\n    jz bml_pow_square_%d\n    imul eax, ebx\n"
            "bml_pow_square_%d:\n    shr ecx, 1\n    imul ebx, ebx\n"
            "    jmp bml_pow_loop_%d\nbml_pow_end_%d:\n",
            numero, numero, numero, numero, numero, numero)) return 0;
    } else { yyerror("operador no reconocido"); return 0; }
    return emitir("    mov [bml_v%d], eax\n", destino);
}

int main(void) {
    int i;
    int resultado = yyparse();
    if (resultado != 0) return resultado;
    if (!validarSimbolos()) return 1;
    printf("BITS 32\nsection .bss\n");
    for (i = 0; i < cantidadSimbolos; i++) printf("bml_v%d resd 1\n", i);
    printf("bml_buffer resb 17\nbml_char resb 1\n");
    printf("section .data\n"
        "bml_msg_division db 'Error: division por cero o resultado fuera de rango',10\n"
        "bml_len_division equ $-bml_msg_division\n"
        "bml_msg_exponent db 'Error: exponente negativo',10\n"
        "bml_len_exponent equ $-bml_msg_exponent\n"
        "bml_msg_input db 'Error: READ requiere un entero de 32 bits',10\n"
        "bml_len_input equ $-bml_msg_input\n");
    printf("section .text\nglobal _start\n_start:\n");
    printf("%s", codigo);
    printf("    mov eax, 1\n    xor ebx, ebx\n    int 0x80\n");
    escribirRutinas();
    printf("\nsection .note.GNU-stack noalloc noexec nowrite progbits\n");
    return 0;
}

void yyerror(const char *mensaje) {
    extern int yylineno;
    extern char *yytext;
    fprintf(stderr, "Error: %s en la linea %d cerca de %s\n", mensaje, yylineno, yytext);
}

void escribirRutinas(void) {
    fputs(
        "\n"
        "bml_output:\n"
        "    pushad\n"
        "    mov esi, eax\n"
        "    mov edi, bml_buffer + 16\n"
        "    mov byte [edi], 10\n"
        "    test eax, eax\n"
        "    jns bml_output_digits\n"
        "    neg eax\n"
        "bml_output_digits:\n"
        "    mov ebx, 10\n"
        "bml_output_loop:\n"
        "    xor edx, edx\n"
        "    div ebx\n"
        "    add dl, '0'\n"
        "    dec edi\n"
        "    mov [edi], dl\n"
        "    test eax, eax\n"
        "    jnz bml_output_loop\n"
        "    test esi, esi\n"
        "    jns bml_output_write\n"
        "    dec edi\n"
        "    mov byte [edi], '-'\n"
        "bml_output_write:\n"
        "    mov ecx, edi\n"
        "    mov edx, bml_buffer + 17\n"
        "    sub edx, edi\n"
        "    mov eax, 4\n"
        "    mov ebx, 1\n"
        "    int 0x80\n"
        "    popad\n"
        "    ret\n"
        "\n"
        "bml_read_char:\n"
        "    mov eax, 3\n"
        "    xor ebx, ebx\n"
        "    mov ecx, bml_char\n"
        "    mov edx, 1\n"
        "    int 0x80\n"
        "    ret\n"
        "bml_input:\n"
        "    push ebx\n"
        "    push ecx\n"
        "    push edx\n"
        "    push esi\n"
        "    push edi\n"
        "    push ebp\n"
        "    xor esi, esi\n"
        "    xor edi, edi\n"
        "    xor ebp, ebp\n"
        "bml_input_skip:\n"
        "    call bml_read_char\n"
        "    cmp eax, 1\n"
        "    jne bml_error_input\n"
        "    mov al, [bml_char]\n"
        "    cmp al, ' '\n"
        "    je bml_input_skip\n"
        "    cmp al, 9\n"
        "    je bml_input_skip\n"
        "    cmp al, 10\n"
        "    je bml_input_skip\n"
        "    cmp al, 13\n"
        "    je bml_input_skip\n"
        "    cmp al, '-'\n"
        "    jne bml_input_plus\n"
        "    mov edi, 1\n"
        "    jmp bml_input_after_sign\n"
        "bml_input_plus:\n"
        "    cmp al, '+'\n"
        "    jne bml_input_digit\n"
        "bml_input_after_sign:\n"
        "    call bml_read_char\n"
        "    cmp eax, 1\n"
        "    jne bml_error_input\n"
        "bml_input_digit:\n"
        "    movzx edx, byte [bml_char]\n"
        "    cmp edx, '0'\n"
        "    jb bml_input_delimiter\n"
        "    cmp edx, '9'\n"
        "    ja bml_input_delimiter\n"
        "    sub edx, '0'\n"
        "    cmp esi, 214748364\n"
        "    ja bml_error_input\n"
        "    jb bml_input_accumulate\n"
        "    mov eax, 7\n"
        "    add eax, edi\n"
        "    cmp edx, eax\n"
        "    ja bml_error_input\n"
        "bml_input_accumulate:\n"
        "    imul esi, esi, 10\n"
        "    add esi, edx\n"
        "    inc ebp\n"
        "    call bml_read_char\n"
        "    cmp eax, 0\n"
        "    je bml_input_done\n"
        "    jl bml_error_input\n"
        "    jmp bml_input_digit\n"
        "bml_input_delimiter:\n"
        "    cmp edx, ' '\n"
        "    je bml_input_done\n"
        "    cmp edx, 9\n"
        "    je bml_input_done\n"
        "    cmp edx, 10\n"
        "    je bml_input_done\n"
        "    cmp edx, 13\n"
        "    jne bml_error_input\n"
        "bml_input_done:\n"
        "    test ebp, ebp\n"
        "    jz bml_error_input\n"
        "    mov eax, esi\n"
        "    test edi, edi\n"
        "    jz bml_input_return\n"
        "    neg eax\n"
        "bml_input_return:\n"
        "    pop ebp\n"
        "    pop edi\n"
        "    pop esi\n"
        "    pop edx\n"
        "    pop ecx\n"
        "    pop ebx\n"
        "    ret\n"
        "bml_error_division:\n"
        "    mov ecx, bml_msg_division\n"
        "    mov edx, bml_len_division\n"
        "    jmp bml_error\n"
        "bml_error_exponent:\n"
        "    mov ecx, bml_msg_exponent\n"
        "    mov edx, bml_len_exponent\n"
        "    jmp bml_error\n"
        "bml_error_input:\n"
        "    mov ecx, bml_msg_input\n"
        "    mov edx, bml_len_input\n"
        "bml_error:\n"
        "    mov eax, 4\n"
        "    mov ebx, 2\n"
        "    int 0x80\n"
        "    mov eax, 1\n"
        "    mov ebx, 1\n"
        "    int 0x80\n"
        , stdout);
}
