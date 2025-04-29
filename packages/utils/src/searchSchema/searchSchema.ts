import { first } from "lodash";
import {
  Boolean,
  Key,
  List,
  Operator,
  Program,
  Statement,
  Statements,
  Token,
  TokenType,
  Value,
} from "@/searchSchema/types";

const TOKEN_SPEC: Array<[RegExp, TokenType]> = [
  [/^\s+/, "whitespace"],
  [/^:/, "colon"],
  [/(^-?\d+\.\d+)|(^-?\.\d+)|(^-?\d+)/, "number"],
  [/^'/, "single-quote"],
  [/^"/, "douple-quote"],
  [/^!/, "bang"],
  [/^=/, "eq"],
  [/^>/, "gt"],
  [/^</, "lt"],
  [/^null/, "null"],
  [/^,/, "coma"],
  [/^\[/, "open-square-bracket"],
  [/^\]/, "close-square-bracket"],
  [/^\{/, "open-curly-bracket"],
  [/^\}/, "close-curly-bracket"],
  [/^\(/, "open-round-bracket"],
  [/^\)/, "close-round-bracket"],
  [/^[^\s:\d=><"'!,[\]{}()]/, "char"],
];

class Tokenizer {
  private cursor: number;
  private src: string;
  private buffer: Token[];

  constructor(src: string = "") {
    this.src = src;
    this.cursor = 0;
    this.buffer = [];
  }

  hasMoreTokens(): boolean {
    return this.cursor < this.src.length;
  }

  isEof() {
    return this.cursor === this.src.length;
  }

  next(): Token | null {
    if (!this.hasMoreTokens()) return null;
    const src = this.src.slice(this.cursor);

    for (const [expr, type] of TOKEN_SPEC) {
      const matched = expr.exec(src);
      if (matched === null) continue;
      const value = first(matched);
      if (typeof value === "undefined")
        throw new Error("missing expression value; should never happen");

      // advance the cursor
      this.cursor += value.length;
      const token = { type, value };
      this.buffer.push(token);
      return token;
    }

    throw new Error(`unexpected token at index=${this.cursor} src=${src}`);
  }

  undo() {
    const token = this.buffer.pop();
    if (!token) return;
    this.src = token.value + this.src;
    this.cursor -= token.value.length;
  }
}

class Parser {
  private src: string;
  private tokenizer: Tokenizer | null;
  private lookahead: Token | null;

  constructor() {
    this.src = "";
    this.tokenizer = null;
    this.lookahead = null;
  }

  parse(src: string) {
    this.src = src;
    this.tokenizer = new Tokenizer(src);
    this.lookahead = this.tokenizer.next();
    return this.program();
  }

  /**
   * ```
   * program
   *    : statements
   *    ;
   * ```
   */
  program(): Program {
    return { type: "program", value: this.statements() };
  }

  /**
   * statements
   *    | statement statement statement ...
   *    ;
   */
  statements() {
    const statements: Statements = [];

    while (this.lookahead !== null) {
      statements.push(this.statement());
    }

    return statements;
  }

  /**
   * statement
   *    : is ':' boolean
   *    : key operator value
   *    ;
   */
  statement(): Statement {
    const key = this.key();

    if (key === "is") {
      this.eat("colon");
      const { key, value } = this.boolean();
      this.eatop("whitespace");

      return {
        key,
        value,
        operator: "eq",
      };
    }

    const operator = this.operator();
    const value = this.value();
    this.eatop("whitespace");

    return {
      key,
      operator,
      value,
    };
  }

  /**
   * key
   *  : 'is'
   *  | chars
   *  ;
   */
  key(): Key {
    let key = "";

    while (
      !this.isNext("colon", "eq", "bang", "whitespace") &&
      !!this.lookahead
    ) {
      key += this.eat().value;
    }

    return key;
  }

  /**
   * operator
   *  : '='
   *  | '!='
   *  | ':'
   *  | ':>'
   *  | ':>='
   *  | ':<'
   *  | ':<='
   *  ;
   */
  operator(): Operator {
    if (this.isNext("bang")) {
      this.eat("bang");
      this.eat("eq");
      return "noeq";
    }

    if (this.isNext("eq")) return this.eatr("eq", "eq");

    this.eat("colon");
    if (!this.isNext("gt", "lt")) return "eq";

    if (this.isNext("gt")) {
      this.eat("gt");
      if (!this.isNext("eq")) return "gt";
      return this.eatr("eq", "gte");
    }

    if (this.isNext("lt")) {
      this.eat("lt");
      if (!this.isNext("eq")) return "lt";
      return this.eatr("eq", "lte");
    }

    return "eq";
  }

  /**
   * value
   *  : list
   *  | string
   *  | number
   *  | boolean
   *  | null
   *  ;
   */
  value(): Value {
    if (
      this.isNext(
        "open-square-bracket",
        "open-curly-bracket",
        "open-round-bracket"
      )
    )
      return this.list();
    if (this.isNext("null")) return this.null();
    if (this.isNext("single-quote", "douple-quote", "char"))
      return this.string();
    return this.number();
  }

  /**
   * number
   *  : int
   *  | flaot
   *  ;
   */
  number() {
    return Number(this.eat("number").value);
  }

  /**
   * string
   *  : unquotedString
   *  | quotedString
   *  ;
   */
  string(): string {
    if (this.isNext("single-quote", "douple-quote")) return this.quotedString();
    return this.unquotedString();
  }

  /**
   * unquotedString
   *  : string
   *  ;
   */
  unquotedString(): string {
    let content = "";

    while (
      !this.isNext(
        "whitespace",
        "coma",
        "open-square-bracket",
        "open-curly-bracket",
        "open-round-bracket",
        "close-square-bracket",
        "close-curly-bracket",
        "close-round-bracket"
      ) &&
      this.lookahead
    ) {
      content += this.eat().value;
    }

    return content;
  }

  /**
   * quotedString
   *  : quote any...any quote
   *  ;
   */
  quotedString(): string {
    // consume the opening quote
    const start = this.isNext("single-quote")
      ? this.eat("single-quote")
      : this.eat("douple-quote");

    let content = "";

    while (!this.isNext(start.type)) {
      content += this.eat().value;
    }

    // consume the closing quote
    this.eat(start.type);

    return content;
  }

  /**
   * boolean
   *  : '!'? key
   */
  boolean(): Boolean {
    // `!` => false
    // n/a => true
    const value = !this.eatop("bang");
    const key = this.key();
    return { key, value };
  }

  null(): null {
    this.eat("null");
    return null;
  }

  /**
   * list
   *  : value value ....
   *  ;
   */
  list(): List {
    // consume the opening parenthesis
    const start = this.eatListOpeningToken();
    const end = this.matchListClosingToken(start.type);
    const list: List = [];

    while (!this.isNext(end) && this.lookahead) {
      list.push(this.value());
      this.eatop("coma");
      this.eatop("whitespace");
    }

    // consume the closing parenthesis
    this.eat(end);

    return list;
  }

  private eatListOpeningToken() {
    if (this.isNext("open-curly-bracket"))
      return this.eat("open-curly-bracket");
    if (this.isNext("open-square-bracket"))
      return this.eat("open-square-bracket");
    return this.eat("open-round-bracket");
  }

  private matchListClosingToken(type: TokenType): TokenType {
    if (type === "open-square-bracket") return "close-square-bracket";
    if (type === "open-curly-bracket") return "close-curly-bracket";
    if (type === "open-round-bracket") return "close-round-bracket";
    throw new Error(`unexpected list token: ${type}`);
  }

  private eat(type?: TokenType): Token {
    const token = this.lookahead;
    if (!token)
      throw new Error(
        `unexpected end of input, expected token of type ${type}`
      );

    if (type && token.type !== type)
      throw new Error(`unexpected token: ${token.type}, expected: ${type}`);

    if (!this.tokenizer)
      throw new Error("tokenizer is not initialized, should never happen.");

    this.lookahead = this.tokenizer.next();

    return token;
  }

  /**
   * eat then return the value
   */
  private eatr<T>(type: TokenType, value: T) {
    this.eat(type);
    return value;
  }

  /**
   * Optional eat token if exist.
   */
  private eatop(type: TokenType): Token | null {
    if (this.isNext(type)) return this.eat(type);
    return null;
  }

  private isNext(...types: TokenType[]) {
    return types.some((type) => this.lookahead?.type === type);
  }
}

function parse(src: string) {
  return new Parser().parse(src);
}

export const searchSchema = { parse };
