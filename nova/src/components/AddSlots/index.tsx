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
import { useIntl } from "react-intl";

const AddSlots: React.FC = () => {
  const intl = useIntl();

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
      <Form className="flex flex-col gap-4">
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
            <Select
              placeholder={intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.end-time.placeholder"
                ],
              })}
              list={repeatOptions}
            />
          }
        />
      </Form>
    </Dialog>
  );
};

export default AddSlots;
