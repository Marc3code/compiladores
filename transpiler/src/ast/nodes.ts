// src/ast/nodes.ts
// Definições dos nós AST usados pelo parser (expandido)

export type ProgramNode = {
  type: 'Program';
  body: StatementNode[];
};

export type StatementNode =
  | VarDeclNode
  | AssignNode
  | ExprStmtNode
  | IfNode
  | ReturnNode
  | ProcDeclNode
  | WhileNode
  | ForNode
  | ImportNode
  | DiscardNode;

export type ExprNode =
  | BinaryExprNode
  | CallExprNode
  | IdentifierNode
  | LiteralNode;

export type VarDeclNode = {
  type: 'VarDecl';
  kind: 'var' | 'let';
  name: string;
  value: ExprNode | null;
};

export type AssignNode = {
  type: 'Assign';
  target: IdentifierNode; // for simplicity: only identifiers
  value: ExprNode;
};

export type ExprStmtNode = {
  type: 'ExprStatement';
  expression: ExprNode;
};

export type IfNode = {
  type: 'If';
  condition: ExprNode;
  thenBranch: StatementNode[];
  elifBranches: { condition: ExprNode; body: StatementNode[] }[];
  elseBranch: StatementNode[] | null;
};

export type ReturnNode = {
  type: 'Return';
  value: ExprNode | null;
};

export type ProcDeclNode = {
  type: 'ProcDecl';
  name: string;
  params: ParamNode[];
  returnType: string | null;
  body: StatementNode[];
};

export type ParamNode = {
  name: string;
  type: string | null;
};

export type WhileNode = {
  type: 'While';
  condition: ExprNode;
  body: StatementNode[];
};

export type ForNode = {
  type: 'For';
  iterator: string;      // loop variable name
  iterable: ExprNode;    // expression after 'in' (e.g., range)
  body: StatementNode[];
};

export type ImportNode = {
  type: 'Import';
  module: string;
};

export type DiscardNode = {
  type: 'Discard';
  expression: ExprNode | null;
};

export type BinaryExprNode = {
  type: 'BinaryExpr';
  operator: string;
  left: ExprNode;
  right: ExprNode;
};

export type CallExprNode = {
  type: 'CallExpr';
  callee: ExprNode; // usually IdentifierNode
  args: ExprNode[];
};

export type IdentifierNode = {
  type: 'Identifier';
  name: string;
};

export type LiteralNode = {
  type: 'Literal';
  value: string | number | boolean | null;
};
