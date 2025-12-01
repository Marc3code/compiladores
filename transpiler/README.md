✅ 1. Objetivo Geral do Projeto

Criar um transpilador simplificado que recebe um subconjunto da linguagem Nim e gera código equivalente em TypeScript, respeitando tipos básicos, estruturas de controle e funções.

O foco acadêmico é demonstrar:

Entendimento de análise léxica, análise sintática, AST (Árvore Sintática Abstrata), análise semântica e geração de código.

Noções de mapeamento entre paradigmas: Nim (imperativo + estático) → TypeScript (imperativo + estático, com superset do JS).

Construção modular de um compilador/transpilador real.

🎯 2. Escopo Funcional (o que o transpilador deve suportar)
2.1 Tipos suportados

int

float

bool

string

2.2 Estruturas de controle

✔ if/elif/else
✔ while
✔ for com range simples

2.3 Expressões

✔ Aritméticas: + - \* / %
✔ Comparações: == != < <= > >=
✔ Booleanas: and or not
✔ Atribuição simples: =

2.4 Estruturas importantes

✔ Declaração de variáveis (var, let, const do Nim → let ou const do TS)
✔ Funções com parâmetros tipados
✔ Retorno de função
✔ Chamadas de função

2.5 Saída

O transpilador deve gerar:

código TypeScript equivalente, formatado

com verificação semântica (tipos básicos e variáveis não declaradas)

❌ Escopo fora (o que NÃO será implementado)

🚫 Generic types
🚫 Metaprogramação de Nim
🚫 Templates/macros
🚫 Callable types complexos
🚫 Módulos e imports entre arquivos
🚫 Ponteiros ou unsafe code
🚫 FFI
🚫 Tipos numéricos avançados (int64, uint16 etc)
🚫 Orientação a objetos de Nim (object, ref object)
