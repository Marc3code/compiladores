# Concorrência em Nim com async/await
# Vamos simular entregadores de pizza entregando em tempos diferentes.

import asyncdispatch, os

proc entregaPizza(nome: string, tempo: int): Future[void] {.async.} =
  echo nome, " pegou a pizza"
  await sleepAsync(tempo * 1000) # espera "tempo" segundos
  echo nome, " entregou a pizza em ", tempo, " segundos!"

proc main() {.async.} =
  # Dois entregadores saindo juntos
  await (entregaPizza("João", 2) and entregaPizza("Maria", 4))
  echo "Todas as pizzas foram entregues!"

waitFor main()
