import { Users } from "@/models/users";
import { Slots } from "@/models/slots";
import { Tutors } from "@/models/tutors";
import { Lessons } from "@/models/lessons";
import { Ratings } from "@/models/ratings";
import { Subscriptions } from "@/models/subscriptions";
import { Rooms } from "@/models/room";
import { Complex } from "@/models/complex";

// services
export const users = new Users();
export const slots = new Slots();
export const tutors = new Tutors();
export const lessons = new Lessons();
export const ratings = new Ratings();
export const subscriptions = new Subscriptions();
export const rooms = new Rooms();
export const complex = new Complex();

// types
export { User } from "@/models/users";
export { Slot } from "@/models/slots";
export { Tutor } from "@/models/tutors";
export { Lesson } from "@/models/lessons";
export { Rating } from "@/models/ratings";
export { Subscription } from "@/models/subscriptions";
export { Room } from "@/models/room";
export { Complex } from "@/models/complex";
