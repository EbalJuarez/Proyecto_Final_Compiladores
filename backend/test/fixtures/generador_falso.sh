#!/bin/sh
# Generador falso para las pruebas: cumple el contrato de bmlang con el IDE.
#   --tac archivo.bml  -> TAC fijo por stdout
#   --asm archivo.bml  -> hola_mundo.asm por stdout
#   sin opción         -> valida (siempre "Programa válido")
dir=$(dirname "$0")
case "$1" in
  --tac) printf 't1 = 10\n$a = t1\nwrite $a\n' ;;
  --asm) cat "$dir/hola_mundo.asm" ;;
  *) cat > /dev/null; echo "Programa válido" ;;
esac
