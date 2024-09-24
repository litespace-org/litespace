import { OnMessage, useChat } from "@/hooks/chat";
import {
  Button,
  ButtonSize,
  Controller,
  Form,
  useFormatMessage,
  useKeys,
} from "@litespace/luna";
import { sanitizeMessage } from "@litespace/sol";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  message: string;
};

const MessageBox: React.FC<{
  room: number | null;
  onMessage: OnMessage;
}> = ({ room, onMessage }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({ defaultValues: { message: "" } });
  const { sendMessage } = useChat(onMessage);

  const send = useCallback(
    (message: string) => {
      const sanitized = sanitizeMessage(message);
      if (!sanitized || !room) return;
      form.reset();
      sendMessage({
        roomId: room,
        message: sanitized,
      });
    },
    [form, room, sendMessage]
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(({ message }) => send(message)),
    [form, send]
  );

  useEffect(() => {
    if (room) form.reset();
  }, [form, room]);

  useKeys(
    useCallback(() => {
      const message = form.watch("message");
      return send(message);
    }, [form, send]),
    "Ctrl+Enter"
  );

  return (
    <Form onSubmit={onSubmit} className="flex flex-col gap-2.5">
      <Controller.TextEditor
        control={form.control}
        name="message"
        value={form.watch("message")}
        error={form.formState.errors.message?.message}
        className="min-h-20"
      />
      <Button
        disabled={!sanitizeMessage(form.watch("message")) || !room}
        size={ButtonSize.Small}
      >
        {intl("global.labels.send")}
      </Button>
    </Form>
  );
};

export default MessageBox;
