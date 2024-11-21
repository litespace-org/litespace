import { Atlas, TokenType } from "@litespace/atlas";
import { Backend } from "@litespace/types";

export function atlas(token?: string): Atlas {
  return new Atlas(Backend.Local, () => {
    if (!token) return null;
    return {
      type: TokenType.Bearer,
      value: token,
    };
  });
}

export default {
  atlas,
};
