; Hola mundo en NASM x86-64 (Linux): imprime un saludo, lee un entero con signo
; de stdin y lo imprime. Se usa para probar "Generar ejecutable" y "Ejecutar"
; mientras no exista el generador de NASM.
;   nasm -f elf64 -o hola.o hola_mundo.asm && ld -o hola hola.o
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
    mov rax, 1
    mov rdi, 1
    mov rsi, saludo
    mov rdx, saludo_len
    syscall

    ; read(0, entrada, 32)
    mov rax, 0
    mov rdi, 0
    mov rsi, entrada
    mov rdx, 32
    syscall

    ; atoi con signo: rbx = número, r8 = 1 si es negativo
    xor rbx, rbx
    xor r8d, r8d
    test rax, rax
    jle .convertir              ; sin entrada: imprime 0
    mov rsi, entrada
    lea rdx, [entrada + rax]    ; fin de lo leído
    cmp byte [rsi], '-'
    jne .digitos
    mov r8d, 1
    inc rsi
.digitos:
    cmp rsi, rdx
    jae .signo
    movzx eax, byte [rsi]
    sub eax, '0'
    cmp eax, 9
    ja .signo                   ; termina en el primer carácter que no es dígito
    imul rbx, rbx, 10
    add rbx, rax
    inc rsi
    jmp .digitos
.signo:
    test r8d, r8d
    jz .convertir
    neg rbx

.convertir:
    ; itoa: escribe los dígitos de derecha a izquierda terminando en salto de línea
    lea rdi, [salida + 31]
    mov byte [rdi], 10
    mov rax, rbx
    xor r9d, r9d
    test rax, rax
    jns .itoa
    neg rax
    mov r9d, 1
.itoa:
    mov rcx, 10
.siguiente:
    xor edx, edx
    div rcx
    add dl, '0'
    dec rdi
    mov [rdi], dl
    test rax, rax
    jnz .siguiente
    test r9d, r9d
    jz .imprimir
    dec rdi
    mov byte [rdi], '-'

.imprimir:
    mov r12, rdi                ; syscall conserva r12

    ; write(1, etiqueta, etiqueta_len)
    mov rax, 1
    mov rdi, 1
    mov rsi, etiqueta
    mov rdx, etiqueta_len
    syscall

    ; write(1, número, longitud)
    mov rax, 1
    mov rdi, 1
    mov rsi, r12
    lea rdx, [salida + 32]
    sub rdx, r12
    syscall

    ; exit(0)
    mov rax, 60
    xor edi, edi
    syscall
