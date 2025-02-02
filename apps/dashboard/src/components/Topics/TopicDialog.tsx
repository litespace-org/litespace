import { useCreateTopic, useUpdateTopic } from "@litespace/headless/topic";
import { Button, ButtonSize } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { Field, Form, Controller, Label } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { ITopic, Void } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  arabicName: string;
  englishName: string;
};

const TopicDialog: React.FC<{
  topic?: ITopic.Self;
  open: boolean;
  close: Void;
  onUpdate?: Void;
}> = ({ open, close, onUpdate, topic }) => {
  const toast = useToast();
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: {
      arabicName: topic?.name.ar || "",
      englishName: topic?.name.en || "",
    },
  });
  const errors = form.formState.errors;

  const onCreateSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.topics.add.success"),
    });
    form.reset();
    close();
    if (onUpdate) return onUpdate();
  }, [close, intl, form, onUpdate, toast]);

  const onCreateError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.topics.add.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const createTopic = useCreateTopic({
    onSuccess: onCreateSuccess,
    onError: onCreateError,
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
    (error: Error) => {
      toast.error({
        title: intl("dashboard.topics.edit.success"),
        description: error.message,
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
        if (!topic) return createTopic.mutate({ arabicName, englishName });
        return updateTopic.mutate({
          id: topic.id,
          payload: { arabicName, englishName },
        });
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
              state={errors.arabicName ? "error" : undefined}
              helper={errors.arabicName?.message}
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
              state={errors.englishName ? "error" : undefined}
              helper={errors.englishName?.message}
            />
          }
        />

        <div className="flex flex-row items-center gap-2">
          <Button
            loading={createTopic.isPending || updateTopic.isPending}
            disabled={createTopic.isPending || updateTopic.isPending}
            size={ButtonSize.Tiny}
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
