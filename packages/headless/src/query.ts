import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateQuery() {
  const client = useQueryClient();
  return useCallback(
    (keys: (string | number)[]) => client.invalidateQueries({ queryKey: keys }),
    []
  );
}
