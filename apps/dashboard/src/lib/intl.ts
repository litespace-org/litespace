import ar from "@/locales/ar-eg.json" assert { type: "json" };
import { LocalId } from "@litespace/ui/locales";

export type LocalMap = Record<keyof typeof ar, keyof typeof ar>;

export type LocalDashId = keyof LocalMap | LocalId;