# Nim tem arrays fixos, seq (listas dinâmicas), conjuntos e tabelas.

# Array fixo de tamanho 3
var numeros = [1, 2, 3]
echo "Array: ", numeros

# Seq = lista que cresce
var frutas: seq[string] = @["maçã", "banana"]
frutas.add("laranja")
echo "Frutas: ", frutas

# Conjunto 
var vogais = {'a', 'e', 'i', 'o', 'u'}
echo "Tem 'a' no conjunto? ", 'a' in vogais

# Tabela (dicionário)
import tables
var idade: Table[string, int]
idade["Ana"] = 20
idade["Terceiro"] = 25
echo "Idade da Ana: ", idade["Ana"]