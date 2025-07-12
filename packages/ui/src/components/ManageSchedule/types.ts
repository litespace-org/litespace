export type SlotState = "unchanged" | "updated" | "created" | "removed";

export type Slot = {
  /**
   * 0 incase the slot is still new.
   */
  id: number;
  /**
   * Slot start in ISO format.
   */
  start: string;
  /**
   * Slot end in ISO format.
   */
  end: string;
  /**
   * The day that the slot belongs to in ISO format.
   */
  day: string;
  state: SlotState;
  original?: Readonly<{ start: string; end: string }>;
};
