// src/runParser.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';

function main() {
  const inputFile = process.argv[2] || 'examples/input/teste1.nim';
  const path = join(process.cwd(), inputFile);
  const src = readFileSync(path, 'utf8');
  const lexer = new Lexer(src);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parseProgram();

  console.log(JSON.stringify(ast, null, 2));
}

main();
