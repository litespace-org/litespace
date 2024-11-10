import { useCreateTopic, useUpdateTopic } from "@litespace/headless/topic";
import { Button } from "@litespace/luna/Button";
import { Dialog } from "@litespace/luna/Dialog";
import { Field, Form, Controller, Label } from "@litespace/luna/Form";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import { ITopic } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  arabicName: string;
  englishName: string;
};

const TopicDialog: React.FC<{
  topic?: ITopic.Self;
  open: boolean;
  close: () => void;
  onUpdate?: () => void;
}> = ({ open, close, onUpdate, topic }) => {
  const toast = useToast();
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: {
      arabicName: topic?.name.ar || "",
      englishName: topic?.name.en || "",
    },
  });

  const onAddSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.topics.add.success"),
    });
    form.reset();
    close();
    if (onUpdate) return onUpdate();
  }, [close, intl, form, onUpdate, toast]);

  const onAddError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl("dashboard.topics.add.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, toast]
  );

  const createTopic = useCreateTopic({
    onSuccess: onAddSuccess,
    onError: onAddError,
  });

  const onEditSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.topics.edit.success"),
    });
    form.reset();
    close();
    if (onUpdate) return onUpdate();
  }, [close, intl, form, onUpdate, toast]);

  const onEditError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl("dashboard.topics.edit.success"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, toast]
  );

  const updateTopic = useUpdateTopic({
    onSuccess: onEditSuccess,
    onError: onEditError,
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(({ arabicName, englishName }) => {
        if (topic)
          return updateTopic.mutate({
            id: topic.id,
            payload: { arabicName, englishName },
          });

        createTopic.mutate({ arabicName, englishName });
      }),
    [form, createTopic, updateTopic, topic]
  );

  return (
    <Dialog
      open={open}
      close={close}
      title={
        topic ? intl("dashboard.topics.edit") : intl("dashboard.topics.add")
      }
      className="w-full md:w-[700px] text-foreground"
    >
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label={<Label>{intl("dashboard.topics.name.ar")}</Label>}
          field={
            <Controller.Input
              placeholder={intl("dashboard.topics.name.ar")}
              control={form.control}
              value={form.watch("arabicName")}
              name="arabicName"
            />
          }
        />
        <Field
          label={<Label>{intl("dashboard.topics.name.en")}</Label>}
          field={
            <Controller.Input
              placeholder={intl("dashboard.topics.name.en")}
              control={form.control}
              value={form.watch("englishName")}
              name="englishName"
            />
          }
        />

        <div className="flex flex-row items-center gap-2 ">
          <Button
            loading={createTopic.isPending}
            disabled={createTopic.isPending || createTopic.isPending}
          >
            {topic
              ? intl("dashboard.topics.edit")
              : intl("dashboard.topics.add")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default TopicDialog;
