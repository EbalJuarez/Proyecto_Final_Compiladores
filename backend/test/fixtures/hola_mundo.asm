; Hola mundo en NASM x86 (Linux): imprime un saludo, lee un entero con signo
; de stdin y lo imprime. Se usa para probar "Generar ejecutable" y "Ejecutar"
; con la misma arquitectura que el traductor TAC a NASM.
;   nasm -f elf32 -o hola.o hola_mundo.asm && ld -m elf_i386 -o hola hola.o
;   echo 42 | ./hola   ->  Hola mundo / Numero: 42

section .data
    saludo       db "Hola mundo", 10
    saludo_len   equ $ - saludo
    etiqueta     db "Numero: "
    etiqueta_len equ $ - etiqueta

section .bss
    entrada resb 32
    salida  resb 32

section .text
    global _start

_start:
    ; write(1, saludo, saludo_len)
    mov eax, 4
    mov ebx, 1
    mov ecx, saludo
    mov edx, saludo_len
    int 0x80

    ; read(0, entrada, 32)
    mov eax, 3
    xor ebx, ebx
    mov ecx, entrada
    mov edx, 32
    int 0x80
    mov ebp, eax

    ; atoi con signo: ebx = número, edi = 1 si es negativo
    xor ebx, ebx
    xor edi, edi
    test ebp, ebp
    jle .convertir              ; sin entrada: imprime 0
    mov esi, entrada
    lea edx, [entrada + ebp]    ; fin de lo leído
    cmp byte [esi], '-'
    jne .digitos
    mov edi, 1
    inc esi
.digitos:
    cmp esi, edx
    jae .signo
    movzx eax, byte [esi]
    sub eax, '0'
    cmp eax, 9
    ja .signo                   ; termina en el primer carácter que no es dígito
    imul ebx, ebx, 10
    add ebx, eax
    inc esi
    jmp .digitos
.signo:
    test edi, edi
    jz .convertir
    neg ebx

.convertir:
    ; itoa: escribe los dígitos de derecha a izquierda terminando en salto de línea
    lea edi, [salida + 31]
    mov byte [edi], 10
    mov eax, ebx
    xor esi, esi
    test eax, eax
    jns .itoa
    neg eax
    mov esi, 1
.itoa:
    mov ecx, 10
.siguiente:
    xor edx, edx
    div ecx
    add dl, '0'
    dec edi
    mov [edi], dl
    test eax, eax
    jnz .siguiente
    test esi, esi
    jz .imprimir
    dec edi
    mov byte [edi], '-'

.imprimir:
    mov ebp, edi

    ; write(1, etiqueta, etiqueta_len)
    mov eax, 4
    mov ebx, 1
    mov ecx, etiqueta
    mov edx, etiqueta_len
    int 0x80

    ; write(1, número, longitud)
    mov eax, 4
    mov ebx, 1
    mov ecx, ebp
    lea edx, [salida + 32]
    sub edx, ebp
    int 0x80

    ; exit(0)
    mov eax, 1
    xor ebx, ebx
    int 0x80
