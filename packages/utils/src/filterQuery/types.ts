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
  operator?: Operator;
  value?: Value;
};

export type Operator = "eq" | "noeq" | "gt" | "gte" | "lt" | "lte";

export type Query = Record<
  string,
  Value | Partial<Record<Operator, Value>> | undefined
>;

export type JsonBoolean = {
  type: "boolean";
  default?: boolean;
  description?: string;
};

export type JsonString = {
  type: "string";
  enum?: string[];
  description?: string;
  default?: string;
};

export type JsonNumber = {
  type: "number";
  enum?: number[];
  default?: number;
  minimum?: number;
  maximum?: number;
  description?: string;
};

export type JsonInteger = {
  type: "integer";
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  default?: number;
  description?: string;
  enum?: number[];
};

export type JsonArray = {
  type: "array";
  items: JsonString | JsonNumber | JsonInteger | JsonBoolean;
  description?: string;
};

export type JsonComparisonOperators = {
  type: "object";
  properties: {
    gte?: JsonNumber | JsonString;
    lte?: JsonNumber | JsonString;
    gt?: JsonNumber | JsonString;
    lt?: JsonNumber | JsonString;
  };
};

export type JsonComparable = {
  anyOf: Array<JsonNumber | JsonString | JsonComparisonOperators>;
};

export type JsonObject = {
  type: "object";
  properties: {
    [key: string]:
      | JsonString
      | JsonNumber
      | JsonInteger
      | JsonBoolean
      | JsonArray
      | JsonComparable;
  };
};
