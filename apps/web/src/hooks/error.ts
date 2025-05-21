import { router } from "@/lib/routes";
import { capture } from "@/lib/sentry";
import { useLogger } from "@litespace/headless/logger";
import { ApiErrorCode, Optional, Void } from "@litespace/types";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { LocalId } from "@litespace/ui/locales";
import { isForbidden, ResponseError } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export type ErrorPayload = {
  raw: unknown;
  messageId: LocalId;
  errorCode?: ApiErrorCode;
};

type QueryPayload = {
  type: "query";
  error: unknown;
  keys: unknown[];
  handler?: Handler | null;
};
type MutationPayload = { type: "mutation"; handler?: Handler | null };
type OnErrorPayload = QueryPayload | MutationPayload;

type Handler = (payload: ErrorPayload) => void;

export function useOnError(payload: OnErrorPayload) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const handlerRef = useRef<Optional<Handler | null>>(payload.handler);
  const resetQueryRef = useRef<Optional<Void>>(undefined);
  const logger = useLogger();

  useEffect(() => {
    handlerRef.current = payload.handler;

    if (payload.type === "query" && payload.error)
      resetQueryRef.current = () =>
        client.removeQueries({
          queryKey: payload.keys,
        });
  });

  const onError = useCallback(
    (error: unknown) => {
      logger.error(error);
      capture(error);

      // Direct the user to the login page.
      if (isForbidden(error))
        return navigate(
          router.web({
            route: Web.Login,
          })
        );

      if (!handlerRef.current) return;
      const messageId = getErrorMessageId(error);
      handlerRef.current({
        messageId,
        raw: error,
        errorCode: error instanceof ResponseError ? error.errorCode : undefined,
      });
    },
    [logger, navigate]
  );

  useEffect(() => {
    if (payload.type === "query" && payload.error) onError(payload.error);
  }, [onError, payload]);

  useEffect(() => {
    return () => {
      if (resetQueryRef.current) resetQueryRef.current();
    };
  }, []);

  return onError;
}
