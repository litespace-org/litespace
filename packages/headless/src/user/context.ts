import { ITutor, IUser, Void } from "@litespace/types";
import { createContext, useContext } from "react";

export type Context = {
  user: IUser.Self | null;
  meta: ITutor.Self | null;
  loading: boolean;
  error: boolean;
  errorObj: Error | null;
  fetching: boolean;
  refetch: { user: Void; meta: Void };
  set: (payload: {
    user?: IUser.Self;
    meta?: ITutor.Self;
    token?: string;
    remember?: boolean;
  }) => void;
  logout: Void;
};

export const UserContext = createContext<Context | null>(null);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === null)
    throw new Error(`useUser must be used within its provider`);
  return context;
}
