# Opcionais são úteis quando algo pode ou não ter valor.
# E generics permitem escrever código mais flexível.

import options

proc dividir(a, b: int): Option[int] =
  if b == 0:
    return none(int)   # nenhum valor
  else:
    return some(a div b)

let resultado = dividir(10, 2)
if resultado.isSome:
  echo "10 / 2 = ", resultado.get
else:
  echo "Divisão inválida"

# Agora generics: função que inverte valores
proc inverter[T](a, b: var T) =
  let temp = a
  a = b
  b = temp

var x = 5
var y = 10
inverter(x, y)
echo "Depois de inverter: x = ", x, ", y = ", y