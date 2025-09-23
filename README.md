#Instruções
Como Rodar Nim no Windows (com MSYS2)

Para rodar programas em Nim na sua máquina usando MSYS2, siga os passos abaixo:

Pré-requisitos
1. Instalar o Nim

Baixe e instale o Nim a partir do site oficial:
Nim - Instalação no Windows

2. Instalar o MSYS2

Baixe e instale o MSYS2: MSYS2

Abra o terminal MSYS2 e atualize os pacotes:

pacman -Syu

3. Instalar o compilador C (MinGW-w64)

No terminal MSYS2, instale o GCC para a arquitetura x86_64:

pacman -S mingw-w64-x86_64-gcc

4. Configurar o PATH

Adicione os diretórios bin do Nim e do MinGW-w64 ao PATH do Windows, ou use diretamente o terminal MSYS2 MINGW64.

Exemplo:

C:\nim\bin
C:\msys64\mingw64\bin

Verificar instalação

No terminal MSYS2 MINGW64, rode:

nim -v
gcc -v


Se os comandos retornarem as versões do Nim e do GCC, a instalação está correta.

Rodando um programa Nim

Crie um arquivo .nim com o seguinte conteúdo:

echo "Hello, world!"


Compile e rode o programa pelo terminal:

nim compile --run ola.nim


O comando acima compila o programa e já o executa, mostrando a saída (Hello, world!) no terminal.
