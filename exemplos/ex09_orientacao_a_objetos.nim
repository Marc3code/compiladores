# Nim tem objetos e também herança com ref object.

type
  Pessoa = object of RootObj
    nome: string
    idade: int

  Aluno = ref object of Pessoa
    matricula: string


var p = Pessoa(nome: "Ana", idade: 20)
var a = Aluno(nome: "Carlos", idade: 21, matricula: "2023A")

echo "Pessoa: ", p.nome, " - ", p.idade
echo "Aluno: ", a.nome, " - ", a.idade, " - matrícula: ", a.matricula
