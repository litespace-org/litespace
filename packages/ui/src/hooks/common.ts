import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";

export function useReload() {
  const naviate = useNavigate();
  return useCallback(() => naviate(0), [naviate]);
}

export function useRender() {
  const [open, setOpen] = useState<boolean>(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(!open), [open]);

  return {
    open,
    show,
    hide,
    toggle,
    setOpen,
  };
}

export function useBlock(block?: boolean | (() => boolean)) {
  const blockRef = useRef(block);

  useEffect(() => {
    blockRef.current = block;
  });

  const shouldBlock = useCallback(() => {
    if (typeof blockRef.current === "function") return blockRef.current();
    return !!blockRef.current;
  }, []);

  useBlocker(() => {
    if (shouldBlock())
      return !window.confirm("Changes you made may not be saved.");
    return false;
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
