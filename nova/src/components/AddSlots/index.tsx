import {
  Button,
  ButtonSize,
  Dialog,
  Field,
  Form,
  Input,
  Label,
  messages,
  Select,
} from "@litespace/luna";
import { ISlot } from "@litespace/types";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";

type IForm = {
  title: string;
  date: { start: string; end: string };
  time: { start: string; end: string };
  repeat: ISlot.Repeat;
};

const AddSlots: React.FC = () => {
  const intl = useIntl();
  const form = useForm<IForm>({
    defaultValues: {
      title: "",
      date: { start: "", end: "" },
      time: { start: "", end: "" },
      repeat: ISlot.Repeat.No,
    },
  });

  const onSubmit = useMemo(() => form.handleSubmit(() => {}), [form]);

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
              register={form.register("title")}
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
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.start-date.placeholder"
                  ],
                })}
                register={form.register("date.start")}
                error={form.formState.errors["date"]?.start?.message}
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
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.end-date.placeholder"
                  ],
                })}
                register={form.register("date.end")}
                error={form.formState.errors["date"]?.end?.message}
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
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.start-time.placeholder"
                  ],
                })}
                register={form.register("time.start")}
                error={form.formState.errors["time"]?.start?.message}
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
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.end-time.placeholder"
                  ],
                })}
                register={form.register("time.end")}
                error={form.formState.errors["time"]?.end?.message}
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