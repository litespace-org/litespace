import { Users } from "@/database/users";
import { Slots } from "@/database/slots";

// services
export const users = new Users();
export const slots = new Slots();

// types
export { User } from "@/database/users";
