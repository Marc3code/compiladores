# O * indica que essa função vai ser pública
proc dobro*(x: int): int =
  result = x * 2

# Se tivesse algo que eu NÃO quisesse expor, era só deixar sem o *

proc secreto(x: int): int =
  result = x - 1
