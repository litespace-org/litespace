export type TokenType =
  | "colon"
  | "single-quote"
  | "douple-quote"
  | "gt"
  | "lt"
  | "eq"
  | "number"
  | "char"
  | "whitespace"
  | "bang"
  | "null"
  | "coma"
  | "open-square-bracket"
  | "close-square-bracket"
  | "open-curly-bracket"
  | "close-curly-bracket"
  | "open-round-bracket"
  | "close-round-bracket";

export type Token = {
  type: TokenType;
  value: string;
};

export type ExpressionType = "program";

export type Program = {
  type: "program";
  value: Statements;
};

export type Statements = Statement[];

export type Key = "is" | (string & Record<never, never>);

export type Value = string | number | boolean | null | List;

export type List = Value[];

export type Boolean = {
  key: string;
  value: boolean;
};

export type Statement = {
  key: Key;
  operator: Operator;
  value: Value;
};

export type Operator = "eq" | "noeq" | "gt" | "gte" | "lt" | "lte";
