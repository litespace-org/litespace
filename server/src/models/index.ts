import { Users } from "@/models/users";
import { Slots } from "@/models/slots";
import { Tutors } from "@/models/tutors";
import { Lessons } from "@/models/lessons";
import { Ratings } from "@/models/ratings";
import { Subscriptions } from "@/models/subscriptions";
import { Rooms } from "@/models/rooms";
import { Messages } from "@/models/messages";
import { Complex } from "@/models/complex";

// services
export const slots = new Slots();
export const tutors = new Tutors();
export const lessons = new Lessons();
export const ratings = new Ratings();
export const subscriptions = new Subscriptions();
export const rooms = new Rooms();
export const messages = new Messages();
export const complex = new Complex();
export { examiners } from "@/models/examiners";
export { users } from "@/models/users";

// types
export { Slot } from "@/models/slots";
export { Tutor } from "@/models/tutors";
export { Lesson } from "@/models/lessons";
export { Rating } from "@/models/ratings";
export { Subscription } from "@/models/subscriptions";
export { Room } from "@/models/rooms";
export { Message } from "@/models/messages";
export { Complex } from "@/models/complex";
