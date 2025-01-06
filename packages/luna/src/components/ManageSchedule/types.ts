export type Slot = {
  /**
   * 0 incase the slot is still new.
   */
  id: number;
  /**
   * Slot start in ISO format.
   */
  start: string | null;
  /**
   * Slot end in ISO format.
   */
  end: string | null;
  /**
   * The day that the slot belongs to in ISO format.
   */
  day: string;
  state: "unchanged" | "updated" | "new";
};
