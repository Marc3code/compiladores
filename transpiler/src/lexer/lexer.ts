// src/lexer.ts
// Lexer minimal funcional para Nim-like (indentation-sensitive).
// Produz tokens: INDENT/DEDENT, NEWLINE, EOF, KW, IDENT, NUMBER, STRING, OP, COLON, COMMA, LPAREN, RPAREN

// Tipo de token aceito pelo lexer
export type TokenType =
  | 'INDENT' | 'DEDENT' | 'NEWLINE' | 'EOF'
  | 'KW' | 'IDENT' | 'NUMBER' | 'STRING'
  | 'OP' | 'COLON' | 'COMMA' | 'LPAREN' | 'RPAREN'
  ;

// Estrutura do token com posição (linha/coluna) para diagnóstico/erros
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

// Conjunto de palavras reservadas reconhecidas como KW
const KEYWORDS = new Set<string>([
  'var','let','if','elif','else','while','for','proc','return', 'in',
  'discard','of','when','const','type','import'
]);

// Lista de operadores — usada para "longest match" (ex.: '==' antes de '=')
const OPERATORS = [
  '==','!=','<=','>=','->',':=', '+', '-', '*', '/', '%', '<', '>', '=', '.', '..'
];

export class Lexer {
  // texto-fonte
  private src: string;
  // posição atual no texto (índice), linha e coluna para rastrear localizações
  private pos = 0;
  private line = 1;
  private col = 1;
  // pilha de níveis de indentação; começa com 0 (coluna base)
  private indentStack: number[] = [0];
  // tokens produzidos
  private tokens: Token[] = [];

  constructor(src: string) {
    // normaliza CRLF para LF para evitar problemas de plataforma
    this.src = src.replace(/\r\n/g, '\n');
  }

  // peek retorna o caractere na posição atual + n (sem avançar)
  private peek(n = 0) {
    return this.src[this.pos + n];
  }
  // eof: chegamos ao fim do arquivo?
  private eof() { return this.pos >= this.src.length; }
  // advance: move a posição adiante n caracteres, atualizando linha/coluna
  private advance(n = 1) {
    while (n-- > 0) {
      if (this.eof()) return;
      const ch = this.src[this.pos++];
      if (ch === '\n') { this.line++; this.col = 1; }
      else this.col++;
    }
  }

  // adiciona um token à lista (linha/col são do ponto atual; bom para debugging)
  private addToken(type: TokenType, value = '') {
    this.tokens.push({ type, value, line: this.line, col: this.col });
  }

  // Função principal: percorre o input e produz tokens
  tokenize(): Token[] {
    while (!this.eof()) {
      // Se estamos no começo de linha (col == 1), tratamos indentação primeiro
      if (this.col === 1) {
        this.handleIndentation();
        if (this.eof()) break;
      }

      const ch = this.peek();

      // espaços e tabs (fora de início de linha) são ignorados
      if (ch === ' ' || ch === '\t') {
        this.advance();
        continue;
      }

      // comentário inicia com '#', consumir até o fim da linha
      if (ch === '#') {
        while (!this.eof() && this.peek() !== '\n') this.advance();
        continue;
      }

      // newline: consumir e emitir token NEWLINE
      if (ch === '\n') {
        this.advance();
        this.addToken('NEWLINE', '\\n');
        // após consumir newline, o loop volta e a próxima iteração tratará indentação
        continue;
      }

      // strings: suporte para aspas simples ou duplas; chama readString()
      if (ch === '"' || ch === "'") {
        this.readString();
        continue;
      }

      // números (começando por dígito)
      if (/\d/.test(ch)) {
        this.readNumber();
        continue;
      }

      // identificadores e keywords (começam por letra ou underscore)
      if (/[A-Za-z_]/.test(ch)) {
        this.readIdentOrKeyword();
        continue;
      }

      // pontuação simples
      if (ch === ':') { this.advance(); this.addToken('COLON', ':'); continue; }
      if (ch === ',') { this.advance(); this.addToken('COMMA', ','); continue; }
      if (ch === '(') { this.advance(); this.addToken('LPAREN', '('); continue; }
      if (ch === ')') { this.advance(); this.addToken('RPAREN', ')'); continue; }

      // operadores: tenta cascar por operadores (maior primeiro)
      const op = this.matchOperator();
      if (op) {
        this.addToken('OP', op);
        continue;
      }

      // se chegar aqui: caractere desconhecido. Consome e emite OP com esse char
      // (poderíamos lançar erro em vez disso; aqui optamos por não travar o lexer)
      this.addToken('OP', ch);
      this.advance();
    }

    // Ao final do arquivo, "desenrola" os INDENTs com DEDENTs
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.addToken('DEDENT', '');
    }
    // marca fim do arquivo
    this.addToken('EOF', '');
    return this.tokens;
  }

  // Trata a contagem de indentação no início de linha:
  // - conta espaços/tabs
  // - se a linha é em branco (somente espaços antes do newline), consome esses espaços e retorna
  // - compara com o topo da pilha de indent; emite INDENT se aumentou,
  //   emite DEDENTs se diminuiu; se igual só consome
  private handleIndentation() {
    let count = 0;
    let p = this.pos;
    // conta espaços e tabs (tab = 4 espaços)
    while (p < this.src.length) {
      const c = this.src[p];
      if (c === ' ') { count++; p++; }
      else if (c === '\t') { count += 4; p++; }
      else break;
    }
    // se a linha é em branco (seguida de newline ou EOF), só consome os espaços e volta
    const next = this.src[p];
    if (next === '\n' || next === undefined) {
      while (this.pos < p) this.advance();
      return;
    }

    // compara com o topo da pilha de indentação
    const top = this.indentStack[this.indentStack.length - 1];
    if (count > top) {
      // aumentou: novo nível de indent -> push e emite INDENT
      this.indentStack.push(count);
      while (this.pos < p) this.advance();
      this.addToken('INDENT', '');
    } else if (count < top) {
      // diminuiu: emite tantos DEDENTs necessários
      while (this.pos < p) this.advance();
      while (this.indentStack.length > 0 && count < (this.indentStack[this.indentStack.length - 1])) {
        this.indentStack.pop();
        this.addToken('DEDENT', '');
      }
      // se após desenrolar a pilha o nível não bate, é erro de indentação
      if (count !== this.indentStack[this.indentStack.length - 1]) {
        throw new Error(`Indentation error at line ${this.line}`);
      }
    } else {
      // mesma indentação: apenas consome os espaços
      while (this.pos < p) this.advance();
    }
  }

  // Lê string, suporta triple-quote e escapes simples
  private readString() {
    const quote = this.peek();        // ' ou "
    let value = '';
    this.advance(); // consome a aspa inicial

    // detecta triple-quote (ex.: '''...''' ou """...""")
    if (this.peek() === quote && this.peek(1) === quote) {
      // triple-quote: consome as próximas duas aspas e lê até encontrar 3 aspas seguidas
      this.advance(); this.advance();
      while (!this.eof()) {
        if (this.peek()===quote && this.peek(1)===quote && this.peek(2)===quote) {
          this.advance(); this.advance(); this.advance();
          break;
        }
        value += this.peek();
        this.advance();
      }
    } else {
      // string de linha: respeita escape com backslash
      while (!this.eof() && this.peek() !== quote) {
        if (this.peek() === '\\') {
          // pega o backslash e o próximo caractere (escape simples)
          value += this.peek(); this.advance();
          if (!this.eof()) { value += this.peek(); this.advance(); }
        } else {
          value += this.peek();
          this.advance();
        }
      }
      // consome a aspa de fechamento se ainda existir
      if (this.peek() === quote) this.advance();
    }
    // emite token STRING com o conteúdo (sem as aspas)
    this.addToken('STRING', value);
  }

  // Lê um literal numérico simples (aceita underscore e formas hex/float de forma relaxada)
  private readNumber() {
    let s = '';
    // aceita dígitos, underscore, ponto, x/A-F para hex — simplificado
    while (!this.eof() && /[0-9_.xA-Fa-f]/.test(this.peek())) {
      s += this.peek();
      this.advance();
    }
    this.addToken('NUMBER', s);
  }

  // Identificador ou keyword
  private readIdentOrKeyword() {
    let s = '';
    while (!this.eof() && /[A-Za-z0-9_]/.test(this.peek())) {
      s += this.peek();
      this.advance();
    }
    // se estiver na tabela de keywords, emite KW; senão IDENT
    if (KEYWORDS.has(s)) this.addToken('KW', s);
    else this.addToken('IDENT', s);
  }

  // Verifica se o que segue é um dos operadores listados (faz match pelo maior primeiro)
  private matchOperator(): string | null {
    for (const op of OPERATORS.sort((a,b)=>b.length-a.length)) {
      if (this.src.substr(this.pos, op.length) === op) {
        this.advance(op.length);
        return op;
      }
    }
    return null;
  }
}

// Quick demo se executado diretamente:
// (Este bloco usa 'require' e 'module' e funciona com Node/CommonJS)
if (require.main === module) {
  const fs = require('fs');
  const path = process.argv[2] || 'examples/exemplo.nim';
  const src = fs.readFileSync(path, 'utf8');
  const lex = new Lexer(src);
  const tokens = lex.tokenize();
  console.log(tokens.map(t => `${t.type}${t.value?('('+t.value+')'):'' } @${t.line}:${t.col}`).join('\n'));
}
