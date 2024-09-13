import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useReload() {
  const naviate = useNavigate();
  return useCallback(() => naviate(0), [naviate]);
}
