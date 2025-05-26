import { useCallback, useState } from "react";

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
