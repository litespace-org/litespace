export type UpdateSlotParams = {
  id: number;
  title?: string;
  weekday?: number;
  time?: { start?: string; end?: string };
  date?: { start?: string; end?: string };
};
