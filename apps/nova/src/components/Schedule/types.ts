import { Void } from "@litespace/types";

export type Slot = {
  id: number; // 0 incase the slot is still new.
  start: string | null; // iso date
  end: string | null; // iso date
  state: "unchanged" | "updated" | "new";
};

export type Props = {
  slots: Slot[];
  setSlots: (slots: Slot[]) => void;
  save: Void;
  open: boolean;
  loading?: boolean;
  error?: boolean;
  retry?: Void;
  start: string; // iso date
  onClose: Void;
};

export type SelectList<T extends string | number> = Array<{
  label: string;
  value: T;
}>;
