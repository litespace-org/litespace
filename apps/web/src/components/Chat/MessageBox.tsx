import { Button } from "@litespace/ui/Button";
import { Form, Controller } from "@litespace/ui/Form";
import { useKeys } from "@litespace/ui/hooks/keys";
import { sanitizeMessage } from "@litespace/utils/chat";
import { Void } from "@litespace/types";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useWebFormatMessage } from "@/hooks/intl";

type IForm = {
  message: string;
};

const MessageBox: React.FC<{
  defaultMessage: string;
  update: boolean;
  submit: (message: string) => void;
  discard: Void;
}> = ({ defaultMessage, update, submit, discard }) => {
  const intl = useWebFormatMessage();
  const form = useForm<IForm>({ defaultValues: { message: "" } });
  const message = form.watch("message");
  const sanitizedMessage = useMemo(() => sanitizeMessage(message), [message]);
  const errors = form.formState.errors;

  const send = useCallback(
    (message: string) => {
      const sanitized = sanitizeMessage(message);
      if (!sanitized) return;
      form.reset();
      return submit(sanitized);
    },
    [form, submit]
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(({ message }) => send(message)),
    [form, send]
  );

  useKeys(
    useCallback(() => {
      const message = form.watch("message");
      return send(message);
    }, [form, send]),
    "Ctrl+Enter"
  );

  useEffect(() => {
    if (defaultMessage) form.setValue("message", defaultMessage);
  }, [defaultMessage, form]);

  const cancel = useCallback(() => {
    discard();
    form.reset();
  }, [discard, form]);

  return (
    <Form onSubmit={onSubmit} className="flex flex-col gap-2.5">
      <Controller.Input
        control={form.control}
        name="message"
        autoComplete="off"
        autoFocus
        value={form.watch("message")}
        state={errors.message ? "error" : undefined}
        helper={errors.message?.message}
        className="min-h-10 w-full bg-transparent focus:outline-none"
      />
      <div className="flex flex-row gap-2">
        <Button
          disabled={!sanitizedMessage || sanitizedMessage === defaultMessage}
          size={"medium"}
        >
          {intl(update ? "global.labels.edit" : "global.labels.send")}
        </Button>
        {update ? (
          <Button onClick={cancel} size={"medium"} type={"error"}>
            {intl("global.labels.cancel")}
          </Button>
        ) : null}
      </div>
    </Form>
  );
};

export default MessageBox;
