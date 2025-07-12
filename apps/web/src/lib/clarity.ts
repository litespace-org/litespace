import clarity from "@microsoft/clarity";
import { env } from "@/lib/env";
import { uniqueId } from "lodash";

clarity.init(env.clarityProjectId);

const USER_ID_KEY = "clarity:userId";

export function getCustomeId() {
  const userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    const id = uniqueId();
    localStorage.setItem(USER_ID_KEY, id);
    return id;
  }

  return userId;
}

export const sessionId = uniqueId();

export default clarity;
