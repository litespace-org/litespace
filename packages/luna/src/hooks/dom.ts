import { useCallback, useEffect, useRef } from "react";
import { useRender } from "@/hooks/common";

export function useClosableRef<
  T extends HTMLElement = HTMLElement,
  E extends HTMLElement = HTMLElement
>(exclude?: E | null) {
  const ref = useRef<T>(null);
  const { toggle, hide, show, open } = useRender();

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      const hidable =
        !exclude ||
        (exclude &&
          e.target &&
          e.target instanceof HTMLElement &&
          !exclude.contains(e.target));

      if (
        e.target instanceof HTMLElement &&
        e.target !== ref.current &&
        !ref.current.contains(e.target) &&
        hidable
      )
        hide();
    },
    [exclude, hide]
  );

  useEffect(() => {
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [hide, onClick]);

  return {
    ref,
    toggle,
    hide,
    show,
    open,
  };
}
