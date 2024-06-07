import { Slots } from "@/models/slots";
import { Tutors } from "@/models/tutors";
import { Ratings } from "@/models/ratings";
import { Subscriptions } from "@/models/subscriptions";
import { Rooms } from "@/models/rooms";
import { Messages } from "@/models/messages";
import { Complex } from "@/models/complex";

// services
export const tutors = new Tutors();
export const ratings = new Ratings();
export const subscriptions = new Subscriptions();
export const rooms = new Rooms();
export const messages = new Messages();
export const complex = new Complex();
export { users } from "@/models/users";
export { zoomAccounts } from "@/models/zoomAccounts";
export { slots } from "@/models/slots";
export { calls } from "@/models/calls";

// types
export { Subscription } from "@/models/subscriptions";
export { Room } from "@/models/rooms";
export { Message } from "@/models/messages";
export { Complex } from "@/models/complex";
