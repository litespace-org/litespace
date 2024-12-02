import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog/V2";
import React from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Typography } from "@/components/Typography";
import EditMessageIcon from "@litespace/assets/EditMessage";
import { faker } from "@faker-js/faker/locale/ar";
import { SendInput, ChatMessage } from "@/components/Chat";

const meta: Meta<typeof Dialog> = {
  title: "Dialog/V2",
  component: Dialog,
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<typeof Dialog> = {
  args: {
    trigger: <button>trigger</button>,
    className: "tw-w-[600px]",
    title: (
      <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
        <div className="tw-shrink-0">
          <EditMessageIcon className="[&>*]:tw-stroke-natural-950" />
        </div>
        <Typography
          element="subtitle-2"
          weight="bold"
          className=" tw-text-natural-950"
        >
          {faker.lorem.words(5)}
        </Typography>
      </div>
    ),
    children: (
      <div>
        <div className="tw-my-14">
          <ChatMessage
            message={{ text: faker.lorem.word(10), id: 5 }}
            owner={true}
            viewOnly
          />
        </div>
        <SendInput
          initialMessage={{ text: faker.lorem.word(5), id: 5 }}
          onSubmit={() => {}}
        />
      </div>
    ),
  },
};

export default meta;
