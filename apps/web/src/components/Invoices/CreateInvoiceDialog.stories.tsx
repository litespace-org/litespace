import { StoryObj, Meta } from "@storybook/react";
import { CreateInvoiceDialog } from "@/components/Invoices/CreateInvoiceDialog";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof CreateInvoiceDialog> = {
  title: "CreateInvoiceDialog",
  component: CreateInvoiceDialog,
  parameters: {
    layout: "centered",
  },
  decorators: [(Story) => <Story />],
};

type Story = StoryObj<typeof CreateInvoiceDialog>;

export const primary: Story = {
  args: {
    tutorName: faker.person.fullName(),
    open: true,
    close: () => alert("closing..."),
  },
};

export default meta;
