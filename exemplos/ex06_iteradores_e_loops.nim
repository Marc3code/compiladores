# Iteradores são como funções que produzem valores sob demanda.

# Um iterador que gera os quadrados de 1 até n
iterator quadrados(n: int): int =
  for i in 1..n:
    yield i * i

echo "Quadrados de 1 até 5:"
for q in quadrados(5):
  echo q