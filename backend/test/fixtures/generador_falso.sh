#!/bin/sh
# Generador falso para las pruebas: valida y devuelve TAC fijo.
#   --tac archivo.bml  -> TAC válido por stdout
#   sin opción         -> valida (siempre "Programa válido")
dir=$(dirname "$0")
case "$1" in
  --tac) printf 'main:\nvar $a;\n$a = 10;\npush $a;\ncall output;\n' ;;
  --asm) cat "$dir/hola_mundo.asm" ;;
  *) cat > /dev/null; echo "Programa válido" ;;
esac
