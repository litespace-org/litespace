import { Users } from "@/database/users";
import { Slots } from "@/database/slots";
import { Tutors } from "@/database/tutors";
import { Lessons } from "@/database/lessons";
import { Complex } from "@/database/complex";

// services
export const users = new Users();
export const slots = new Slots();
export const tutors = new Tutors();
export const lessons = new Lessons();
export const complex = new Complex();

// types
export { User } from "@/database/users";
export { Slot } from "@/database/slots";
export { Tutor } from "@/database/tutors";
export { Lesson } from "@/database/lessons";
export { Complex } from "@/database/complex";
