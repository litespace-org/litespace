import { Tokenizer } from "@/filterQuery/tokenizer";
import { Token, TokenType } from "@/filterQuery/types";

export class BaseParser {
  lookahead: Token | null = null;
  tokenizer: Tokenizer | null = null;

  eat(type?: TokenType): Token {
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
  eatr<T>(type: TokenType, value: T) {
    this.eat(type);
    return value;
  }

  /**
   * Optional eat token if exist.
   */
  eatop(type: TokenType): Token | null {
    if (this.isNext(type)) return this.eat(type);
    return null;
  }

  isNext(...types: TokenType[]) {
    return types.some((type) => this.lookahead?.type === type);
  }

  isEof(): boolean {
    return this.lookahead === null;
  }
}
