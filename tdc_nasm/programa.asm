BITS 32
section .bss
bml_v0 resd 1
bml_v1 resd 1
bml_v2 resd 1
bml_v3 resd 1
bml_v4 resd 1
bml_v5 resd 1
bml_v6 resd 1
bml_buffer resb 17
bml_char resb 1
section .data
bml_msg_division db 'Error: division por cero o resultado fuera de rango',10
bml_len_division equ $-bml_msg_division
bml_msg_exponent db 'Error: exponente negativo',10
bml_len_exponent equ $-bml_msg_exponent
bml_msg_input db 'Error: READ requiere un entero de 32 bits',10
bml_len_input equ $-bml_msg_input
section .text
global _start
_start:
    mov eax, 10
    mov [bml_v0], eax
    mov eax, 20
    mov [bml_v1], eax
    mov eax, [bml_v0]
    mov ebx, [bml_v1]
    cmp eax, ebx
    setl al
    movzx eax, al
    mov [bml_v2], eax
    mov eax, [bml_v2]
    test eax, eax
    jz bml_l1
    mov eax, [bml_v0]
    call bml_output
    jmp bml_l2
bml_l1:
    mov eax, [bml_v1]
    call bml_output
bml_l2:
bml_l3:
    mov eax, [bml_v0]
    mov ebx, [bml_v1]
    cmp eax, ebx
    setl al
    movzx eax, al
    mov [bml_v3], eax
    mov eax, [bml_v3]
    test eax, eax
    jz bml_l4
    mov eax, [bml_v0]
    mov ebx, 1
    add eax, ebx
    mov [bml_v4], eax
    mov eax, [bml_v4]
    mov [bml_v0], eax
    jmp bml_l3
bml_l4:
    mov eax, 0
    mov [bml_v0], eax
bml_l5:
    mov eax, [bml_v0]
    mov ebx, 5
    cmp eax, ebx
    setl al
    movzx eax, al
    mov [bml_v5], eax
    mov eax, [bml_v5]
    test eax, eax
    jz bml_l6
    jmp bml_l8
bml_l7:
    mov eax, [bml_v0]
    mov ebx, 1
    add eax, ebx
    mov [bml_v6], eax
    mov eax, [bml_v6]
    mov [bml_v0], eax
    jmp bml_l5
bml_l8:
    mov eax, [bml_v0]
    call bml_output
    jmp bml_l7
bml_l6:
    mov eax, 1
    xor ebx, ebx
    int 0x80

bml_output:
    pushad
    mov esi, eax
    mov edi, bml_buffer + 16
    mov byte [edi], 10
    test eax, eax
    jns bml_output_digits
    neg eax
bml_output_digits:
    mov ebx, 10
bml_output_loop:
    xor edx, edx
    div ebx
    add dl, '0'
    dec edi
    mov [edi], dl
    test eax, eax
    jnz bml_output_loop
    test esi, esi
    jns bml_output_write
    dec edi
    mov byte [edi], '-'
bml_output_write:
    mov ecx, edi
    mov edx, bml_buffer + 17
    sub edx, edi
    mov eax, 4
    mov ebx, 1
    int 0x80
    popad
    ret

bml_read_char:
    mov eax, 3
    xor ebx, ebx
    mov ecx, bml_char
    mov edx, 1
    int 0x80
    ret
bml_input:
    push ebx
    push ecx
    push edx
    push esi
    push edi
    push ebp
    xor esi, esi
    xor edi, edi
    xor ebp, ebp
bml_input_skip:
    call bml_read_char
    cmp eax, 1
    jne bml_error_input
    mov al, [bml_char]
    cmp al, ' '
    je bml_input_skip
    cmp al, 9
    je bml_input_skip
    cmp al, 10
    je bml_input_skip
    cmp al, 13
    je bml_input_skip
    cmp al, '-'
    jne bml_input_plus
    mov edi, 1
    jmp bml_input_after_sign
bml_input_plus:
    cmp al, '+'
    jne bml_input_digit
bml_input_after_sign:
    call bml_read_char
    cmp eax, 1
    jne bml_error_input
bml_input_digit:
    movzx edx, byte [bml_char]
    cmp edx, '0'
    jb bml_input_delimiter
    cmp edx, '9'
    ja bml_input_delimiter
    sub edx, '0'
    cmp esi, 214748364
    ja bml_error_input
    jb bml_input_accumulate
    mov eax, 7
    add eax, edi
    cmp edx, eax
    ja bml_error_input
bml_input_accumulate:
    imul esi, esi, 10
    add esi, edx
    inc ebp
    call bml_read_char
    cmp eax, 0
    je bml_input_done
    jl bml_error_input
    jmp bml_input_digit
bml_input_delimiter:
    cmp edx, ' '
    je bml_input_done
    cmp edx, 9
    je bml_input_done
    cmp edx, 10
    je bml_input_done
    cmp edx, 13
    jne bml_error_input
bml_input_done:
    test ebp, ebp
    jz bml_error_input
    mov eax, esi
    test edi, edi
    jz bml_input_return
    neg eax
bml_input_return:
    pop ebp
    pop edi
    pop esi
    pop edx
    pop ecx
    pop ebx
    ret
bml_error_division:
    mov ecx, bml_msg_division
    mov edx, bml_len_division
    jmp bml_error
bml_error_exponent:
    mov ecx, bml_msg_exponent
    mov edx, bml_len_exponent
    jmp bml_error
bml_error_input:
    mov ecx, bml_msg_input
    mov edx, bml_len_input
bml_error:
    mov eax, 4
    mov ebx, 2
    int 0x80
    mov eax, 1
    mov ebx, 1
    int 0x80

section .note.GNU-stack noalloc noexec nowrite progbits
