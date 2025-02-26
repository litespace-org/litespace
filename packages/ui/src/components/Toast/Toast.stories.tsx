import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "@/components/Toast/Toast";
import React, { useState } from "react";
import { Button } from "@/components/Button";
import { Direction } from "@/components/Direction";
import { ToastProvider, useToast } from "@/components/Toast";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Toast;

const meta: Meta<Component> = {
  title: "Toast",
  component: Toast,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Success: StoryObj<Component> = {
  render() {
    const toast = useToast();

    return (
      <Direction>
        <ToastProvider>
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(4),
                  description: faker.lorem.words(5),
                })
              }
              className="tw-mb-4"
            >
              Short
            </Button>
            <Button
              className="tw-mb-4"
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(10),
                  description: faker.lorem.words(40),
                })
              }
            >
              Long
            </Button>
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(10),
                })
              }
            >
              Title Only
            </Button>
          </div>
        </ToastProvider>
      </Direction>
    );
  },
};

export const Warning: StoryObj<Component> = {
  render() {
    const toast = useToast();
    return (
      <Direction>
        <div className="tw-flex tw-flex-row tw-gap-2">
          <Button
            onClick={() =>
              toast.warning({
                title: faker.lorem.words(4),
                description: faker.lorem.words(5),
              })
            }
          >
            Short
          </Button>
          <Button
            onClick={() =>
              toast.warning({
                title: faker.lorem.words(10),
                description: faker.lorem.words(40),
              })
            }
          >
            Long
          </Button>
          <Button
            onClick={() =>
              toast.warning({
                title: faker.lorem.words(10),
              })
            }
          >
            Title Only
          </Button>
        </div>
      </Direction>
    );
  },
};

export const Error: StoryObj<Component> = {
  render() {
    const toast = useToast();
    return (
      <Direction>
        <ToastProvider>
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Button
              onClick={() =>
                toast.error({
                  title: faker.lorem.words(4),
                  description: faker.lorem.words(5),
                })
              }
            >
              Short
            </Button>
            <Button
              onClick={() =>
                toast.error({
                  title: faker.lorem.words(10),
                  description: faker.lorem.words(40),
                })
              }
            >
              Long
            </Button>
            <Button
              onClick={() =>
                toast.error({
                  title: faker.lorem.words(10),
                })
              }
            >
              Title Only
            </Button>
          </div>
        </ToastProvider>
      </Direction>
    );
  },
};

export const MultiToast: StoryObj<Component> = {
  args: {
    title: faker.lorem.words(5),
    description: faker.lorem.words(8),
    type: "success",
  },
  render(props) {
    const [open, setOpen] = useState<boolean>(false);
    return (
      <Direction>
        <ToastProvider>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Toast {...props} key={1} open={open} onOpenChange={setOpen} />
          <Toast {...props} key={2} open={open} onOpenChange={setOpen} />
        </ToastProvider>
      </Direction>
    );
  },
};

export default meta;
