import utils

proc soma(a: int, b: int, c: int): int =
  var s = a + b - c
  return s

var x = 0
for i in 0..5:
  x = x + i

while x < 100:
  discard x
  x = x + 1

proc hello() =
  echo("oi")
 
