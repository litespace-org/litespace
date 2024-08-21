import {
  Button,
  ButtonSize,
  DateInput,
  Dialog,
  Field,
  Form,
  Input,
  Label,
  messages,
  Select,
  TimePicker,
  toaster,
  useFormatterMap,
  useValidation,
} from "@litespace/luna";
import { ISlot } from "@litespace/types";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/sol";
import { useMutation } from "react-query";
import { atlas } from "@/lib/atlas";

type IForm = {
  title: string;
  date: { start: string; end: string };
  time: { start: Time; end: Time };
  repeat: ISlot.Repeat;
};

const AddSlots: React.FC = () => {
  const intl = useIntl();
  const validate = useValidation();
  const formatterMap = useFormatterMap();
  const form = useForm<IForm>({
    defaultValues: {
      title: "",
      date: { start: dayjs().format("YYYY-MM-DD") },
      repeat: ISlot.Repeat.No,
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: ISlot.CreateApiPayload) => {
      return await atlas.slot.create(payload);
    },
    onSuccess() {
      toaster.success({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.success"],
        }),
      });
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) =>
        mutation.mutate({
          title: fields.title,
          time: {
            start: fields.time.start.format(),
            end: fields.time.end.format(),
          },
          date: fields.date,
          repeat: fields.repeat,
        })
      ),
    [form, mutation]
  );

  const repeatOptions = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.no"],
        }),
        value: ISlot.Repeat.No,
      },
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.daily"],
        }),
        value: ISlot.Repeat.Daily,
      },
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.weekly"],
        }),
        value: ISlot.Repeat.Weekly,
      },
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.monthly"],
        }),
        value: ISlot.Repeat.Monthly,
      },
    ],
    [intl]
  );

  const timeRules = useMemo(() => {
    return {
      start: {
        required: validate.required,
        validate(value: Time, values: IForm): boolean | string {
          return validate.validateTime({
            time: value,
            max: values.time.end,
          });
        },
      },
      end: {
        required: validate.required,
        validate(value: Time, values: IForm): boolean | string {
          return validate.validateTime({
            time: value,
            min: values.time.start,
          });
        },
      },
    };
  }, [validate]);

  const meridiem = useMemo(
    () => ({
      am: intl.formatMessage({
        id: messages["global.labels.am"],
      }),
      pm: intl.formatMessage({
        id: messages["global.labels.pm"],
      }),
    }),
    [intl]
  );

  const disabled = useMemo(() => mutation.isLoading, [mutation.isLoading]);

  return (
    <Dialog
      trigger={
        <Button disabled={disabled} size={ButtonSize.Small}>
          {intl.formatMessage({
            id: messages["page.schedule.edit.add"],
          })}
        </Button>
      }
      title={intl.formatMessage({
        id: messages["page.schedule.edit.add.dialog.title"],
      })}
    >
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.title.label"
                ],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.title.placeholder"
                ],
              })}
              register={form.register("title", validate.slotTitle)}
              error={form.formState.errors["title"]?.message}
              disabled={disabled}
            />
          }
        />

        <div className="flex gap-4">
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.start-date.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                rules={validate.date.start}
                name="date.start"
                render={({ field }) => {
                  const value = form.watch("date.start");
                  return (
                    <DateInput
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.start-date.placeholder"
                        ],
                      })}
                      error={form.formState.errors["date"]?.start?.message}
                      min={dayjs().startOf("day")}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("date.start");
                        form.trigger("date.end");
                      }}
                      value={value}
                      today={intl.formatMessage({
                        id: messages["global.labels.today"],
                      })}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />

          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.end-date.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                rules={validate.date.end}
                name="date.end"
                render={({ field }) => {
                  const value = form.watch("date.end");
                  const min = form.watch("date.start");

                  return (
                    <DateInput
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.end-date.placeholder"
                        ],
                      })}
                      error={form.formState.errors["date"]?.end?.message}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("date.start");
                        form.trigger("date.end");
                      }}
                      min={min ? dayjs(min) : undefined}
                      value={value || ""}
                      today={intl.formatMessage({
                        id: messages["global.labels.today"],
                      })}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />
        </div>
        <div className="flex gap-4">
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.start-time.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                name="time.start"
                rules={timeRules.start}
                render={({ field }) => {
                  return (
                    <TimePicker
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.start-time.placeholder"
                        ],
                      })}
                      error={form.formState.errors["time"]?.start?.message}
                      onChange={(value: Time) => {
                        field.onChange(value);
                        form.trigger("time.start");
                        form.trigger("time.end");
                      }}
                      labels={meridiem}
                      time={form.watch("time.start")}
                      formatterMap={formatterMap}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />

          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.end-time.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                name="time.end"
                rules={timeRules.end}
                render={({ field }) => {
                  return (
                    <TimePicker
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.end-time.placeholder"
                        ],
                      })}
                      error={form.formState.errors["time"]?.end?.message}
                      onChange={(value: Time) => {
                        field.onChange(value);
                        form.trigger("time.start");
                        form.trigger("time.end");
                      }}
                      labels={meridiem}
                      time={form.watch("time.end")}
                      formatterMap={formatterMap}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />
        </div>

        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.repeat.label"
                ],
              })}
            </Label>
          }
          field={
            <Controller
              control={form.control}
              name="repeat"
              render={({ field }) => (
                <Select
                  value={form.watch("repeat")}
                  onChange={field.onChange}
                  list={repeatOptions}
                />
              )}
            />
          }
        />

        <Button
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
          htmlType="submit"
          className="mt-4"
        >
          {intl.formatMessage({
            id: messages["global.labels.confirm"],
          })}
        </Button>
      </Form>
    </Dialog>
  );
};

export default AddSlots;
