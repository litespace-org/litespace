import { IUser } from "@litespace/types";

const USER_KEY = "orbit:user::info";

export function setUser(user: IUser.Self): void {
  return localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): IUser.Self | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function removeUser(): void {
  return localStorage.removeItem(USER_KEY);
}
