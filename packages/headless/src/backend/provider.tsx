import { Backend } from "@litespace/types";
import { BackendContext } from "@/backend/context";
import { GetToken } from "@litespace/atlas";

export const BackendProvider: React.FC<{
  backend: Backend;
  getToken: GetToken;
  children?: React.ReactNode;
}> = ({ children, backend, getToken }) => {
  return (
    <BackendContext.Provider value={{ backend, getToken }}>
      {children}
    </BackendContext.Provider>
  );
};
