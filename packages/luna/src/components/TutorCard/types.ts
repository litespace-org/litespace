import { Void } from "@litespace/types";

export type CardProps = {
  id: number;
  name: string | null;
  bio: string | null;
  about: string | null;
  studentCount: number;
  lessonCount: number;
  rating: number;
  imageUrl?: string | null;
  profileUrl: string;
  topics?: Array<string> | null;
  onBook: Void;
  onOpenProfile: Void;
};
