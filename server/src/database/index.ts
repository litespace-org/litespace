import { Users } from "@/database/users";
import { Slots } from "@/database/slots";
import { Tutors } from "@/database/tutors";
import { Lessons } from "@/database/lessons";
import { Ratings } from "@/database/ratings";
import { Subscriptions } from "@/database/subscriptions";
import { Complex } from "@/database/complex";

// services
export const users = new Users();
export const slots = new Slots();
export const tutors = new Tutors();
export const lessons = new Lessons();
export const ratings = new Ratings();
export const subscriptions = new Subscriptions();
export const complex = new Complex();

// types
export { User } from "@/database/users";
export { Slot } from "@/database/slots";
export { Tutor } from "@/database/tutors";
export { Lesson } from "@/database/lessons";
export { Rating } from "@/database/ratings";
export { Subscription } from "@/database/subscriptions";
export { Complex } from "@/database/complex";
