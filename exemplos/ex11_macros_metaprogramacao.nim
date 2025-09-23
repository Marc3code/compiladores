# Macros permitem gerar código automaticamente durante a compilação.
# Aqui vamos criar uma macro que gera funções de elogio.

import macros
import strutils

macro criaElogio(n: static[string]): untyped =
  let nomeFunc = ident("elogio" & capitalizeAscii(n))
  result = quote do:
    proc `nomeFunc`() =
      echo `n`, ", você é incrível!"

# Isso gera uma função: elogioAna
criaElogio("Ana")

# Agora dá pra chamar como se tivesse escrito na mão
elogioAna()
