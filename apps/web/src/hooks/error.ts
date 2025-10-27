import { capture } from "@/lib/sentry";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";
import { CallError } from "@/modules/MediaCall/types";
import { useUser } from "@litespace/headless/context/user";
import { useLogger } from "@litespace/headless/logger";
import { ApiErrorCode, Optional, Void } from "@litespace/types";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { useToast } from "@litespace/ui/Toast";
import { isUnauthenticated, ResponseError } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export type ErrorPayload = {
  raw: unknown;
  messageId: LocalId;
  errorCode?: ApiErrorCode;
};

type QueryPayload = {
  type: "query";
  error: unknown;
  keys: unknown[] | readonly unknown[];
  handler?: Handler | null;
};
type MutationPayload = { type: "mutation"; handler?: Handler | null };
type OnErrorPayload = QueryPayload | MutationPayload;

type Handler = (payload: ErrorPayload) => void;

export function useOnError(
  payload: OnErrorPayload,
  disableAutoNavigate?: boolean
) {
  const client = useQueryClient();
  const user = useUser();
  const handlerRef = useRef<Optional<Handler | null>>(payload.handler);
  const resetQueryRef = useRef<Optional<Void>>(undefined);
  const logger = useLogger();
  const navigate = useNavigate();

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
      if (isUnauthenticated(error) && !disableAutoNavigate) {
        user.logout();
        return navigate(Web.Login);
      }

      if (!handlerRef.current) return;
      const messageId = getErrorMessageId(error);
      handlerRef.current({
        messageId,
        raw: error,
        errorCode: error instanceof ResponseError ? error.errorCode : undefined,
      });
    },
    [logger, disableAutoNavigate, user, navigate]
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

export function useCallErrorHandler(): ErrorHandler | null {
  const intl = useFormatMessage();
  const toast = useToast();

  const [errorHandler, setErrorHandler] = useState<ErrorHandler | null>(null);

  useEffect(() => {
    const eh = new ErrorHandler();
    eh.on(CallError.UserMediaAccessDenied, () =>
      toast.error({
        title: intl("session.not-allowed.title"),
        description: intl("session.not-allowed.desc"),
      })
    );

    eh.on(CallError.CamNotFound, () =>
      toast.error({
        title: intl("session.device-not-found-error.mic-and-cam.title"),
        description: intl("session.device-not-found-error.mic-and-cam.desc"),
      })
    );

    eh.on(CallError.MicNotFound, () =>
      toast.error({
        title: intl("session.device-not-found-error.mic-and-cam.title"),
        description: intl("session.device-not-found-error.mic-and-cam.desc"),
      })
    );

    eh.on(CallError.TrackNotFound, () =>
      toast.error({
        title: intl("session.device-not-found-error.mic-and-cam.title"),
        description: intl("session.device-not-found-error.mic-and-cam.desc"),
      })
    );

    eh.on(CallError.NotAllowedToJoinSession, () =>
      toast.error({
        title: intl("error.api.forbidden"),
      })
    );

    eh.on(CallError.FullSession, () =>
      toast.error({
        title: intl("session.unexpected-error.title"),
        description: intl("session.unexpected-error.desc"),
      })
    );

    eh.on(CallError.IndexOutOfRange, () =>
      toast.error({
        title: intl("session.unexpected-error.title"),
        description: intl("session.unexpected-error.desc"),
      })
    );

    setErrorHandler(eh);
  }, [setErrorHandler, intl, toast]);

  return errorHandler;
}
