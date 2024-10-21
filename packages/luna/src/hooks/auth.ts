import { Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { atlas } from "@/lib/atlas";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useVerifyEmail({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const verifyEmail = useCallback((token: string) => {
    return atlas.auth.verifyEmail(token);
  }, []);

  return useMutation({
    onSuccess,
    onError,
    mutationFn: verifyEmail,
    mutationKey: ["verify-email"],
  });
}
