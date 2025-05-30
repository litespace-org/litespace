import { Void } from "@litespace/types";
import { useCallback, useEffect, useRef } from "react";
import { useBlocker, useNavigate } from "react-router-dom";

export function useReload() {
  const naviate = useNavigate();
  return useCallback(() => naviate(0), [naviate]);
}

export function useBlock(block?: boolean | (() => boolean), onLeave?: Void) {
  const blockRef = useRef(block);

  useEffect(() => {
    blockRef.current = block;
  });

  const shouldBlock = useCallback(() => {
    if (typeof blockRef.current === "function") return blockRef.current();
    return !!blockRef.current;
  }, []);

  useBlocker(() => {
    if (!shouldBlock()) return false;
    const block = !window.confirm("Changes you made may not be saved.");
    if (!block) onLeave?.();
    return block;
  });

  const onBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!shouldBlock()) return;
      event.preventDefault();
      return "";
    },
    [shouldBlock]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [onBeforeUnload]);
}
