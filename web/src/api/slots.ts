import { client } from "./axios";

export enum Repeat {
  No = "no",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

type RegisterSlotPayload = {
  title: string;
  description: string;
  weekday: number;
  time: { start: string; end: string };
  date: { start: string; end?: string };
  repeat: Repeat;
};

async function register(slot: RegisterSlotPayload) {
  await client.post("/api/v1/slot", JSON.stringify(slot));
}

export default {
  register,
};
