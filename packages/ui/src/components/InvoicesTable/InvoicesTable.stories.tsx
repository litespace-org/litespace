import { StoryObj, Meta } from "@storybook/react";
import { InvoicesTable } from "@/components/InvoicesTable";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { range } from "lodash";

const meta: Meta<typeof InvoicesTable> = {
  title: "InvoicesTable",
  component: InvoicesTable,
  parameters: {
    layout: "centered",
  },
  decorators: (Story) => (
    <div className="w-[90vw]">
      <Story />
    </div>
  ),
};

const methods = [
  IWithdrawMethod.Type.Bank,
  IWithdrawMethod.Type.Instapay,
  IWithdrawMethod.Type.Wallet,
];

const statuses: Exclude<IInvoice.Status, IInvoice.Status.UpdatedByReceiver>[] =
  [
    IInvoice.Status.Fulfilled,
    IInvoice.Status.Pending,
    IInvoice.Status.Rejected,
    IInvoice.Status.CanceledByReceiver,
    IInvoice.Status.CanceledByReceiver,
    IInvoice.Status.CancellationApprovedByAdmin,
  ];

function makeInvoice(minAmount = 100, maxAmount = 10_000) {
  return {
    id: faker.number.int(),
    createdAt: faker.date.past().toISOString(),
    amount: faker.number.int({ min: minAmount, max: maxAmount }),
    method: methods[Math.floor(Math.random() * 3)],
    receiver: faker.phone.number({ style: "national" }).toString(),
    status: statuses[Math.floor(Math.random() * 6)],
  };
}

type Story = StoryObj<typeof InvoicesTable>;

export const Primary: Story = {
  args: {
    invoices: range(15).map(() => makeInvoice()),
    loading: false,
    fetching: false,
    error: false,
    retry: () => alert("retrying..."),
    close: () => alert("closing..."),
    onDelete: () => alert("deleting..."),
  },
};

export const LargeAmounts: Story = {
  args: {
    invoices: range(15).map(() => makeInvoice(100_000, 10_000_000)),
    loading: false,
    fetching: false,
    error: false,
    retry: () => alert("retrying..."),
    close: () => alert("closing..."),
    onDelete: () => alert("deleting..."),
  },
};

export const EmptyTable: Story = {
  args: {
    invoices: [],
    loading: false,
    fetching: false,
    error: false,
    retry: () => alert("retrying..."),
    close: () => alert("closing..."),
    onDelete: () => alert("deleting..."),
  },
};

export const Loading: Story = {
  args: {
    invoices: [],
    loading: true,
    fetching: false,
    error: false,
    retry: () => alert("retrying..."),
    close: () => alert("closing..."),
    onDelete: () => alert("deleting..."),
  },
};

export const Error: Story = {
  args: {
    invoices: [],
    loading: false,
    fetching: false,
    error: true,
    retry: () => alert("retrying..."),
    close: () => alert("closing..."),
    onDelete: () => alert("deleting..."),
  },
};

export default meta;
