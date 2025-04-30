import {
  Boolean,
  Key,
  List,
  Operator,
  Program,
  Query,
  Statement,
  Statements,
  TokenType,
  Value,
} from "@/filterQuery/types";
import { Tokenizer } from "@/filterQuery/tokenizer";
import { BaseParser } from "@/filterQuery/parser";
import { isUndefined } from "lodash";

export class FilterQueryParser extends BaseParser {
  constructor() {
    super();
    this.tokenizer = null;
    this.lookahead = null;
  }

  parse(src: string) {
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
   *    : key ?operator ?value
   *    ;
   */
  statement(): Statement {
    const key = this.key();
    if (this.isEof()) return { key, operator: undefined, value: undefined };

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
    if (this.isEof()) return { key, operator, value: undefined };

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
    this.eatop(end);

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
}

function asQuery(program: Program) {
  const output: Query = {};

  for (const { key, operator, value } of program.value) {
    if (isUndefined(key) || isUndefined(operator) || isUndefined(value))
      continue;

    const current = output[key];

    if (!current && operator === "eq") {
      output[key] = value;
      continue;
    }

    const otherOperators =
      typeof current === "object" || typeof current === "undefined"
        ? current
        : { eq: current };

    output[key] = {
      ...otherOperators,
      [operator]: value,
    };
  }

  return output;
}

function parse(src: string) {
  return asQuery(new FilterQueryParser().parse(src));
}

function program(src: string) {
  return new FilterQueryParser().parse(src);
}

export const filterQuery = { parse, program };
