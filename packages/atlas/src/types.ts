export enum TokenType {
  Bearer = "Bearer",
  Basic = "Basic",
}

export type GetToken = () => null | { type: TokenType; value: string };
