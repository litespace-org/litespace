import { LocalId } from "@/locales";

export type StepData = {
  id: number;
  title: LocalId;
  description: LocalId;
};

export type Interview = {
  tutorManager: {
    id: number;
    name: string | null;
    image: string | null;
  };
  canceledBy?: "canceled-by-you" | "canceled-by-tutor-manager";
  feedback: string | null;
  date: string;
};
