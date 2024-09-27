import { OnMessage, useChat } from "@/hooks/chat";
import {
  Button,
  ButtonSize,
  ButtonType,
  Controller,
  Form,
  useFormatMessage,
  useKeys,
} from "@litespace/luna";
import { sanitizeMessage } from "@litespace/sol";
import { IMessage, Void } from "@litespace/types";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  message: string;
};

const MessageBox: React.FC<{
  room: number | null;
  onMessage: OnMessage;
  cancel: Void;
  edit: IMessage.Self | null;
}> = ({ room, onMessage, cancel, edit }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({ defaultValues: { message: "" } });
  const message = form.watch("message");
  const { sendMessage, updateMessage } = useChat(onMessage);

  const send = useCallback(
    (message: string) => {
      const sanitized = sanitizeMessage(message);
      if (!sanitized || !room) return;
      form.reset();

      if (edit) return updateMessage({ id: edit.id, text: sanitized });
      return sendMessage({ roomId: room, text: sanitized });
    },
    [edit, form, room, sendMessage, updateMessage]
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

  useEffect(() => {
    if (edit) form.setValue("message", edit.text);
  }, [edit, form]);

  const discard = useCallback(() => {
    cancel();
    form.reset();
  }, [cancel, form]);

  return (
    <Form onSubmit={onSubmit} className="flex flex-col gap-2.5">
      <Controller.TextEditor
        control={form.control}
        name="message"
        value={form.watch("message")}
        error={form.formState.errors.message?.message}
        className="min-h-20"
      />
      <div className="flex flex-row gap-2">
        <Button
          disabled={!sanitizeMessage(message) || !room}
          size={ButtonSize.Small}
        >
          {intl(edit ? "global.labels.edit" : "global.labels.send")}
        </Button>
        {edit ? (
          <Button
            onClick={discard}
            size={ButtonSize.Small}
            type={ButtonType.Error}
          >
            {intl("global.labels.cancel")}
          </Button>
        ) : null}
      </div>
    </Form>
  );
};

export default MessageBox;
