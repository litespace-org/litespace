import { Token, TokenType } from "@/filterQuery/types";
import { first } from "lodash";

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

export class Tokenizer {
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
