import { Backend } from "@litespace/types";
import { BackendContext } from "@/backend/context";
import { GetToken, TokenType } from "@litespace/atlas";
import { useCallback } from "react";

export type GetAuthTokenValue = () => string | null;

export const BackendProvider: React.FC<{
  getAuthTokenValue: GetAuthTokenValue;
  children?: React.ReactNode;
  tokenType: TokenType;
  backend: Backend;
}> = ({ children, backend, tokenType, getAuthTokenValue }) => {
  const getToken: GetToken = useCallback(() => {
    const token = getAuthTokenValue();
    if (!token) return null;
    return { type: tokenType, value: token };
  }, [getAuthTokenValue, tokenType]);

  return (
    <BackendContext.Provider value={{ backend, getToken }}>
      {children}
    </BackendContext.Provider>
  );
};
