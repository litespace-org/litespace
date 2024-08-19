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
  useValidation,
} from "@litespace/luna";
import { ISlot } from "@litespace/types";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";

type IForm = {
  title: string;
  date: { start: string; end: string };
  time: { start: string; end: string };
  repeat: ISlot.Repeat;
};

const AddSlots: React.FC = () => {
  const intl = useIntl();
  const validate = useValidation();
  const form = useForm<IForm>({
    defaultValues: {
      title: "",
      date: { start: dayjs().format("YYYY-MM-DD"), end: "" },
      time: { start: "", end: "" },
      repeat: ISlot.Repeat.No,
    },
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) => {
        console.log(fields);
      }),
    [form]
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

  return (
    <Dialog
      trigger={
        <Button size={ButtonSize.Small}>
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
                      value={value}
                      today={intl.formatMessage({
                        id: messages["global.labels.today"],
                      })}
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
                rules={validate.time.start}
                render={({ field }) => {
                  return (
                    <TimePicker
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.start-time.placeholder"
                        ],
                      })}
                      error={form.formState.errors["time"]?.start?.message}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("time.start");
                        form.trigger("time.end");
                      }}
                      labels={meridiem}
                      value={form.watch("time.start")}
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
                rules={validate.time.end}
                render={({ field }) => {
                  return (
                    <TimePicker
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.end-time.placeholder"
                        ],
                      })}
                      error={form.formState.errors["time"]?.end?.message}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("time.start");
                        form.trigger("time.end");
                      }}
                      labels={meridiem}
                      value={form.watch("time.end")}
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

        <Button htmlType="submit" className="mt-4">
          {intl.formatMessage({
            id: messages["global.labels.confirm"],
          })}
        </Button>
      </Form>
    </Dialog>
  );
};

export default AddSlots;
