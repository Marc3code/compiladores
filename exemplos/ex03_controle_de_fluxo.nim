let nota = 8

if nota >= 9:
  echo "Parabéns, nota A!"
elif nota >= 7:
  echo "Mandou bem, nota B!"
else:
  echo "Precisa estudar mais..."

# O case é tipo um switch:
let fruta = "banana"

case fruta
of "banana": echo "A banana é top"
of "maçã": echo "Clássico da lancheira"
else: echo "Não conheço essa fruta"

# loops clássicos
for i in 1..5:
  echo "Contando: ", i

var contador = 3
while contador > 0:
  echo "Contagem regressiva: ", contador
  contador -= 1