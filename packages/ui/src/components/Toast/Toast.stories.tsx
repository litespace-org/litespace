import { Button } from "@/components/Button";
import { Direction } from "@/components/Direction";
import { ToastProvider, useToast } from "@/components/Toast";
import { Toast } from "@/components/Toast/Toast";
import { faker } from "@faker-js/faker/locale/ar";
import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";

type Component = typeof Toast;

const meta: Meta<Component> = {
  title: "Toast",
  component: Toast,
  parameters: { layout: "centered" },
  decorators: [],
};

type Story = StoryObj<Component>;

export const Success: Story = {
  render() {
    const toast = useToast();

    return (
      <Direction>
        <ToastProvider>
          <div className="flex flex-col items-end">
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(4),
                  description: faker.lorem.words(5),
                })
              }
              className="mb-4"
            >
              Short
            </Button>
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(4),
                  description: faker.lorem.words(5),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: false,
                      loading: false,
                      onClick: () => false,
                    },
                  ],
                })
              }
              className="mb-4"
            >
              Short with actions
            </Button>
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(4),
                  description: faker.lorem.words(5),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: true,
                      loading: true,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: true,
                      loading: true,
                      onClick: () => false,
                    },
                  ],
                })
              }
              className="mb-4"
            >
              Short with actions with loading actions
            </Button>
            <Button
              className="mb-4"
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
              className="mb-4"
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(10),
                  description: faker.lorem.words(40),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: false,
                      loading: false,
                      onClick: () => false,
                    },
                  ],
                })
              }
            >
              Long with actions
            </Button>
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(10),
                })
              }
              className="mb-2"
            >
              Title Only
            </Button>
            <Button
              onClick={() =>
                toast.success({
                  title: faker.lorem.words(10),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: false,
                      loading: false,
                      onClick: () => false,
                    },
                  ],
                })
              }
            >
              Title with Actions
            </Button>
          </div>
        </ToastProvider>
      </Direction>
    );
  },
};

export const Info: Story = {
  render() {
    const toast = useToast();
    return (
      <Direction>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={() =>
              toast.info({
                title: faker.lorem.words(4),
                description: faker.lorem.words(5),
              })
            }
          >
            Short
          </Button>
          <Button
            onClick={() =>
              toast.info({
                title: faker.lorem.words(4),
                description: faker.lorem.words(5),
                actions: [
                  {
                    label: faker.lorem.word(),
                    variant: "secondary",
                    disabled: false,
                    loading: false,
                    onClick: () => true,
                  },
                  {
                    label: faker.lorem.word(),
                    variant: "primary",
                    disabled: false,
                    loading: false,
                    onClick: () => false,
                  },
                ],
              })
            }
          >
            Short with actions
          </Button>
          <Button
            onClick={() =>
              toast.info({
                title: faker.lorem.words(10),
                description: faker.lorem.words(40),
              })
            }
          >
            Long
          </Button>
          <Button
            onClick={() =>
              toast.info({
                title: faker.lorem.words(10),
                description: faker.lorem.words(40),
                actions: [
                  {
                    label: faker.lorem.word(),
                    variant: "secondary",
                    disabled: false,
                    loading: false,
                    onClick: () => true,
                  },
                  {
                    label: faker.lorem.word(),
                    variant: "primary",
                    disabled: false,
                    loading: false,
                    onClick: () => false,
                  },
                ],
              })
            }
          >
            Long with actions
          </Button>
          <Button
            onClick={() =>
              toast.info({
                title: faker.lorem.words(10),
              })
            }
          >
            Title Only
          </Button>
          <Button
            onClick={() =>
              toast.info({
                title: faker.lorem.words(10),
                actions: [
                  {
                    label: faker.lorem.word(),
                    variant: "secondary",
                    disabled: false,
                    loading: false,
                    onClick: () => true,
                  },
                  {
                    label: faker.lorem.word(),
                    variant: "primary",
                    disabled: false,
                    loading: false,
                    onClick: () => false,
                  },
                ],
              })
            }
          >
            Title Only with actions
          </Button>
        </div>
      </Direction>
    );
  },
};

export const Warning: Story = {
  render() {
    const toast = useToast();
    return (
      <Direction>
        <div className="flex flex-col items-end gap-2">
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
                title: faker.lorem.words(4),
                description: faker.lorem.words(5),
                actions: [
                  {
                    label: faker.lorem.word(),
                    variant: "secondary",
                    disabled: false,
                    loading: false,
                    onClick: () => true,
                  },
                  {
                    label: faker.lorem.word(),
                    variant: "primary",
                    disabled: false,
                    loading: false,
                    onClick: () => false,
                  },
                ],
              })
            }
          >
            Short with actions
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
                description: faker.lorem.words(40),
                actions: [
                  {
                    label: faker.lorem.word(),
                    variant: "secondary",
                    disabled: false,
                    loading: false,
                    onClick: () => true,
                  },
                  {
                    label: faker.lorem.word(),
                    variant: "primary",
                    disabled: false,
                    loading: false,
                    onClick: () => false,
                  },
                ],
              })
            }
          >
            Long with actions
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
          <Button
            onClick={() =>
              toast.warning({
                title: faker.lorem.words(10),
                actions: [
                  {
                    label: faker.lorem.word(),
                    variant: "secondary",
                    disabled: false,
                    loading: false,
                    onClick: () => true,
                  },
                  {
                    label: faker.lorem.word(),
                    variant: "primary",
                    disabled: false,
                    loading: false,
                    onClick: () => false,
                  },
                ],
              })
            }
          >
            Title Only with actions
          </Button>
        </div>
      </Direction>
    );
  },
};

export const Error: Story = {
  render() {
    const toast = useToast();
    return (
      <Direction>
        <ToastProvider>
          <div className="flex flex-col items-end gap-2">
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
                  title: faker.lorem.words(4),
                  description: faker.lorem.words(5),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: false,
                      loading: false,
                      onClick: () => false,
                    },
                  ],
                })
              }
            >
              Short with actions
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
                  description: faker.lorem.words(40),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: false,
                      loading: false,
                      onClick: () => false,
                    },
                  ],
                })
              }
            >
              Long with actions
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
            <Button
              onClick={() =>
                toast.error({
                  title: faker.lorem.words(10),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      variant: "secondary",
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                    {
                      label: faker.lorem.word(),
                      variant: "primary",
                      disabled: false,
                      loading: false,
                      onClick: () => false,
                    },
                  ],
                })
              }
            >
              Title Only with actions
            </Button>
            <Button
              onClick={() =>
                toast.error({
                  title: faker.lorem.words(10),
                  actions: [
                    {
                      label: faker.lorem.word(),
                      disabled: false,
                      loading: false,
                      onClick: () => true,
                    },
                  ],
                })
              }
            >
              Title only with one action
            </Button>
          </div>
        </ToastProvider>
      </Direction>
    );
  },
};

export const MultiToast: Story = {
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
