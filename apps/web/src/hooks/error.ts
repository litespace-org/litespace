import { router } from "@/lib/routes";
import { capture } from "@/lib/sentry";
import { useUserContext } from "@litespace/headless/context/user";
import { Optional, Void } from "@litespace/types";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { LocalId } from "@litespace/ui/locales";
import { isForbidden } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type ErrorPayload = {
  raw: unknown;
  messageId: LocalId;
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
  const location = useLocation();
  const { logout } = useUserContext();

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
      capture(error);

      // Direct the user to the login page.
      if (isForbidden(error)) {
        logout();
        return navigate(
          router.web({
            route: Web.Login,
            query: {
              // Once the user is logged in, he should be redirected to the same page.
              // TODO: handle search params.
              redirect: location.pathname,
            },
          })
        );
      }

      if (!handlerRef.current) return;
      const messageId = getErrorMessageId(error);
      handlerRef.current({
        messageId,
        raw: error,
      });
    },
    [location.pathname, logout, navigate]
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
