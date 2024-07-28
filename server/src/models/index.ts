import { Ratings } from "@/models/ratings";
import { Subscriptions } from "@/models/subscriptions";
import { Rooms } from "@/models/rooms";
import { Messages } from "@/models/messages";
import { Complex } from "@/models/complex";

// services
export const subscriptions = new Subscriptions();
export const rooms = new Rooms();
export const messages = new Messages();
export const complex = new Complex();
export { users } from "@/models/users";
export { slots } from "@/models/slots";
export { calls } from "@/models/calls";
export { tutors } from "@/models/tutors";
export { plans } from "@/models/plans";
export { coupons } from "@/models/coupons";
export { invites } from "@/models/invites";
export { reports } from "@/models/reports";
export { reportReplies } from "@/models/reportReplies";
export { tokens } from "@/models/tokens";
export { ratings } from "@/models/ratings";
