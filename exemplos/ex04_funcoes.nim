# Funções em Nim são chamadas de "proc".
# Dá pra ter retorno implícito ou explícito.

proc soma(a, b: int): int =
  return a + b

# Retorno implícito usando "result":
proc dobro(x: int): int =
  result = x * 2

echo "3 + 7 = ", soma(3, 7)
echo "Dobro de 5 = ", dobro(5)

# E dá pra sobrecarregar funções: deixar a função com o mesmo nome e sem parametros executa uma coisa e com os paramtros executa outra
proc ola(nome: string) =
  echo "Oi, ", nome, "!"

proc ola() =
  echo "Oi, visitante misterioso!"

ola("Marcos")
ola()