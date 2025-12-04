// src/parser/parser.ts
// Parser recursivo que consome tokens do Lexer e produz AST (usando nodes.ts)

import { Token, TokenType } from '../lexer/lexer';
import {
  ProgramNode, StatementNode, ExprNode,
  VarDeclNode, ExprStmtNode, IfNode, ReturnNode,
  BinaryExprNode, CallExprNode, IdentifierNode, LiteralNode,
  ProcDeclNode, ParamNode, WhileNode, ForNode, AssignNode,
  ImportNode, DiscardNode
} from '../ast/nodes';

// Wrapper para iterar tokens
class TokenStream {
  private tokens: Token[];
  private i = 0;
  constructor(tokens: Token[]) { this.tokens = tokens; }

  peek(n = 0): Token {
    return this.tokens[this.i + n] ?? this.tokens[this.tokens.length - 1];
  }
  next(): Token {
    return this.tokens[this.i++] ?? this.tokens[this.tokens.length - 1];
  }
  eof(): boolean {
    return this.peek().type === 'EOF';
  }
  match(type: TokenType, value?: string): boolean {
    const t = this.peek();
    if (t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    this.next();
    return true;
  }
  expect(type: TokenType, value?: string): Token {
    const t = this.peek();
    if (t.type === type && (value === undefined || t.value === value)) {
      return this.next();
    }
    throw new Error(`Parse error: expected ${type}${value?('('+value+')'):''} but got ${t.type}${t.value?('('+t.value+')'):''} @${t.line}:${t.col}`);
  }
  skipNewlines() {
    while (this.peek().type === 'NEWLINE') this.next();
  }
}

export class Parser {
  private ts: TokenStream;

  constructor(tokens: Token[]) {
    this.ts = new TokenStream(tokens);
  }

  parseProgram(): ProgramNode {
    const body: StatementNode[] = [];
    this.ts.skipNewlines();
    while (!this.ts.eof()) {
      if (this.ts.peek().type === 'EOF') break;
      body.push(this.parseStatement());
      this.ts.skipNewlines();
    }
    return { type: 'Program', body };
  }

  parseStatement(): StatementNode {
    const t = this.ts.peek();
    if (t.type === 'KW') {
      switch (t.value) {
        case 'var':
        case 'let':
          return this.parseVarDecl();
        case 'if':
          return this.parseIf();
        case 'return':
          return this.parseReturn();
        case 'proc':
          return this.parseProc();
        case 'while':
          return this.parseWhile();
        case 'for':
          return this.parseFor();
        case 'import':
          return this.parseImport();
        case 'discard':
          return this.parseDiscard();
      }
    }

    // Assignment statement: IDENT '=' expr (not var/let)
    if ((t.type === 'IDENT' || (t.type === 'KW' && t.value !== undefined)) && this.ts.peek(1).type === 'OP' && this.ts.peek(1).value === '=') {
      return this.parseAssign();
    }

    // Default: expression statement
    const expr = this.parseExpression();
    if (this.ts.peek().type === 'NEWLINE') this.ts.next();
    return { type: 'ExprStatement', expression: expr } as ExprStmtNode;
  }

  parseVarDecl(): VarDeclNode {
    const kw = this.ts.next(); // var | let
    const kind = kw.value as 'var' | 'let';
    const nameTok = this.ts.expect('IDENT');
    let value: ExprNode | null = null;
    if (this.ts.peek().type === 'OP' && this.ts.peek().value === '=') {
      this.ts.next();
      value = this.parseExpression();
    }
    if (this.ts.peek().type === 'NEWLINE') this.ts.next();
    return { type: 'VarDecl', kind, name: nameTok.value, value };
  }

  parseAssign(): AssignNode {
    const idTok = this.ts.next();
    // ensure identifier
    const target: IdentifierNode = { type: 'Identifier', name: idTok.value };
    this.ts.expect('OP', '=');
    const value = this.parseExpression();
    if (this.ts.peek().type === 'NEWLINE') this.ts.next();
    return { type: 'Assign', target, value };
  }

  parseIf(): IfNode {
    this.ts.expect('KW', 'if');
    const condition = this.parseExpression();
    this.ts.expect('COLON');
    this.ts.expect('NEWLINE');
    this.ts.expect('INDENT');
    const thenBranch: StatementNode[] = this.parseBlockStatements();
    const elifBranches: { condition: ExprNode; body: StatementNode[] }[] = [];
    while (this.ts.peek().type === 'KW' && this.ts.peek().value === 'elif') {
      this.ts.next();
      const cond = this.parseExpression();
      this.ts.expect('COLON');
      this.ts.expect('NEWLINE');
      this.ts.expect('INDENT');
      const body = this.parseBlockStatements();
      elifBranches.push({ condition: cond, body });
    }
    let elseBranch: StatementNode[] | null = null;
    if (this.ts.peek().type === 'KW' && this.ts.peek().value === 'else') {
      this.ts.next();
      this.ts.expect('COLON');
      this.ts.expect('NEWLINE');
      this.ts.expect('INDENT');
      elseBranch = this.parseBlockStatements();
    }
    return { type: 'If', condition, thenBranch, elifBranches, elseBranch };
  }

  parseBlockStatements(): StatementNode[] {
    const stmts: StatementNode[] = [];
    this.ts.skipNewlines();
    while (this.ts.peek().type !== 'DEDENT' && this.ts.peek().type !== 'EOF') {
      stmts.push(this.parseStatement());
      this.ts.skipNewlines();
    }
    this.ts.expect('DEDENT');
    return stmts;
  }

  parseReturn(): ReturnNode {
    this.ts.expect('KW', 'return');
    if (this.ts.peek().type === 'NEWLINE') {
      this.ts.next();
      return { type: 'Return', value: null };
    }
    const val = this.parseExpression();
    if (this.ts.peek().type === 'NEWLINE') this.ts.next();
    return { type: 'Return', value: val };
  }

  // parse proc declarations: proc name(param: type, ...) [: returnType] = NEWLINE INDENT body DEDENT
  parseProc(): ProcDeclNode {
    this.ts.expect('KW', 'proc');
    const nameTok = this.ts.expect('IDENT');
    const name = nameTok.value;
    const params: ParamNode[] = [];
    // params
    if (this.ts.peek().type === 'LPAREN') {
      this.ts.next();
      while (this.ts.peek().type !== 'RPAREN') {
        const pNameTok = this.ts.expect('IDENT');
        let pType: string | null = null;
        if (this.ts.peek().type === 'COLON') {
          this.ts.next();
          const tTok = this.ts.expect('IDENT');
          pType = tTok.value;
        }
        params.push({ name: pNameTok.value, type: pType });
        if (this.ts.peek().type === 'COMMA') this.ts.next();
        else break;
      }
      this.ts.expect('RPAREN');
    }
    // optional return type
    let returnType: string | null = null;
    if (this.ts.peek().type === 'COLON') {
      this.ts.next();
      if (this.ts.peek().type === 'IDENT') {
        returnType = this.ts.next().value;
      }
    }
    // body starter: accept '=' or NEWLINE (some Nim styles use '= \\n INDENT')
    if (this.ts.peek().type === 'OP' && this.ts.peek().value === '=') {
      this.ts.next();
    }
    // require NEWLINE then INDENT
    this.ts.expect('NEWLINE');
    this.ts.expect('INDENT');
    const body = this.parseBlockStatements();
    return { type: 'ProcDecl', name, params, returnType, body };
  }

  parseWhile(): WhileNode {
    this.ts.expect('KW', 'while');
    const condition = this.parseExpression();
    this.ts.expect('COLON');
    this.ts.expect('NEWLINE');
    this.ts.expect('INDENT');
    const body = this.parseBlockStatements();
    return { type: 'While', condition, body };
  }

  // for i in 0..10:
  parseFor(): ForNode {
    this.ts.expect('KW', 'for');
    const iterTok = this.ts.expect('IDENT');
    const iterator = iterTok.value;
    // accept 'in' as KW or IDENT (lexer may mark 'in' as IDENT if not in KEYWORDS)
    if (this.ts.peek().type === 'KW' && this.ts.peek().value === 'in') this.ts.next();
    else if (this.ts.peek().type === 'IDENT' && this.ts.peek().value === 'in') this.ts.next();
    else throw new Error(`Parse error: expected 'in' after for iterator @${this.ts.peek().line}:${this.ts.peek().col}`);
    const iterable = this.parseExpression();
    this.ts.expect('COLON');
    this.ts.expect('NEWLINE');
    this.ts.expect('INDENT');
    const body = this.parseBlockStatements();
    return { type: 'For', iterator, iterable, body };
  }

  parseImport(): ImportNode {
    this.ts.expect('KW', 'import');
    // import moduleName
    const modTok = this.ts.expect('IDENT');
    if (this.ts.peek().type === 'NEWLINE') this.ts.next();
    return { type: 'Import', module: modTok.value };
  }

  parseDiscard(): DiscardNode {
    this.ts.expect('KW', 'discard');
    // optional expression to discard
    if (this.ts.peek().type === 'NEWLINE') {
      this.ts.next();
      return { type: 'Discard', expression: null };
    }
    const expr = this.parseExpression();
    if (this.ts.peek().type === 'NEWLINE') this.ts.next();
    return { type: 'Discard', expression: expr };
  }

  // ---------------------------
  // Expressions (precedence climbing)
  // ---------------------------

  // precedence table: larger = higher precedence
  private precedence(op: string): number {
    switch (op) {
      case 'or': return 1;
      case 'and': return 2;
      case '..': return 3;           // range operator
      case '==': case '!=': return 4;
      case '<': case '>': case '<=': case '>=': return 5;
      case '+': case '-': return 6;
      case '*': case '/': case '%': return 7;
      case '.': return 8;
      default: return 0;
    }
  }

  parseExpression(minPrec = 0): ExprNode {
    let left = this.parsePrimary();

    while (true) {
      const t = this.ts.peek();
      if (t.type === 'OP') {
        const op = t.value;
        const prec = this.precedence(op);
        if (prec <= minPrec) break;
        this.ts.next(); // consume operator
        const right = this.parseExpression(prec);
        left = {
          type: 'BinaryExpr',
          operator: op,
          left,
          right
        } as BinaryExprNode;
        continue;
      }
      break;
    }

    return left;
  }

  parsePrimary(): ExprNode {
    const t = this.ts.peek();

    // literals
    if (t.type === 'NUMBER') {
      this.ts.next();
      const raw = t.value;
      const asNum = Number(raw.replace(/_/g, ''));
      return { type: 'Literal', value: isNaN(asNum) ? raw : asNum } as LiteralNode;
    }
    if (t.type === 'STRING') {
      this.ts.next();
      return { type: 'Literal', value: t.value } as LiteralNode;
    }

    // identifier or call
    if (t.type === 'IDENT' || (t.type === 'KW' && t.value === 'echo')) {
      const idTok = this.ts.next();
      let node: ExprNode = { type: 'Identifier', name: idTok.value } as IdentifierNode;

      // function call?
      if (this.ts.peek().type === 'LPAREN') {
        this.ts.next(); // consume '('
        const args: ExprNode[] = [];
        if (this.ts.peek().type !== 'RPAREN') {
          while (true) {
            args.push(this.parseExpression());
            if (this.ts.peek().type === 'COMMA') { this.ts.next(); continue; }
            break;
          }
        }
        this.ts.expect('RPAREN');
        node = { type: 'CallExpr', callee: node, args } as CallExprNode;
      }
      return node;
    }

    // parenthesized expression
    if (t.type === 'LPAREN') {
      this.ts.next();
      const expr = this.parseExpression();
      this.ts.expect('RPAREN');
      return expr;
    }

    throw new Error(`Parse error: unexpected token ${t.type}${t.value?('('+t.value+')'):''} @${t.line}:${t.col}`);
  }
}
