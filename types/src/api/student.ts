import { Credentials } from "@/user";

export type RegisterStudentPayload = Credentials & { name: string };

export type RegisterStudentResponse = { token: string };
