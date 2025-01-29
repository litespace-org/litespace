import { Void } from "@litespace/types";
import { identity } from "lodash";
import { useCallback, useEffect } from "react";

export function useKeys(handler: Void, shortcut: string) {
  const onKeydown = useCallback(
    (event: KeyboardEvent) => {
      const ctrl = event.ctrlKey ? "Ctrl" : "";
      const alt = event.altKey ? "Alt" : "";
      const key = ["Control", "Alt"].includes(event.key) ? "" : event.key;
      const raw = [ctrl, alt, key].filter(identity).join("+");
      const fire = raw === shortcut;
      if (fire) handler();
    },
    [handler, shortcut]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [handler, onKeydown]);
}
