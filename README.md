# compiladores

Como Rodar Nim (com MSYS2)

Para rodar programas em Nim na sua máquina usando MSYS2, siga os passos abaixo:

Pré-requisitos

Instalar o Nim
Baixe e instale o Nim a partir do site oficial: https://nim-lang.org/install_windows.html
.

Instalar o MSYS2

Baixe e instale o MSYS2: https://www.msys2.org

Abra o terminal MSYS2 e atualize os pacotes utilizando o comando: pacman -Syu

Instalar o compilador C (MinGW-w64) via MSYS2
No terminal MSYS2, instale o GCC para a arquitetura x86_64 utilizando o comando: pacman -S mingw-w64-x86_64-gcc

Configurar o PATH
Adicione os diretórios bin do Nim e do MinGW-w64 ao PATH do Windows ou use diretamente o terminal MSYS2 MINGW64.

Exemplo: C:\nim\bin e C:\msys64\mingw64\bin

Verificar instalação

No terminal MSYS2 MINGW64, rode: 
nim -v
gcc -v

Se os comandos retornarem as versões do Nim e do GCC, a instalação está correta.

Após a instalação é só criar um arquivo .nim e rodar: echo "hello, world!", na IDE de sua preferência.
