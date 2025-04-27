import { StoryObj, Meta } from "@storybook/react";
import { IframeDialog } from "@/components/IframeDialog/IframeDialog";
import React, { useCallback, useEffect } from "react";

type Component = typeof IframeDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "IframeDialog",
  component: IframeDialog,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

export const Primary: Story = {
  args: {
    open: true,
    url: "https://atfawry.fawrystaging.com/atfawry/plugin/card-token?accNo=770000020774&customerProfileId=4&returnUrl=https%3A%2F%2Fapp.staging.litespace.org%2Fsubscription&locale=ar",
    onOpenChange(open) {
      alert(`open=${open}`);
    },
  },
};

export const CardAdded: Story = {
  args: {
    open: true,
    url: "http://localhost:3000/card-added",
    onOpenChange(open) {
      alert(`open=${open}`);
    },
  },
  render(props) {
    const onMessage = useCallback((e: MessageEvent<string>) => {
      console.log(e.data);
    }, []);

    useEffect(() => {
      window.addEventListener("message", onMessage);
      return () => {
        window.removeEventListener("message", onMessage);
      };
    }, [onMessage]);

    return <IframeDialog {...props} />;
  },
};

export const Loading: Story = {
  args: {
    open: true,
    loading: true,
    onOpenChange(open) {
      alert(`open=${open}`);
    },
  },
};

export default meta;
