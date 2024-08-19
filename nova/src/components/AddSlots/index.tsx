import { Button, ButtonSize, Dialog, messages } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";

const AddSlots: React.FC = () => {
  const intl = useIntl();
  return (
    <Dialog
      trigger={
        <Button size={ButtonSize.Small}>
          {intl.formatMessage({
            id: messages["page.schedule.edit.add"],
          })}
        </Button>
      }
      title={"k"}
    >
      Hello
    </Dialog>
  );
};

export default AddSlots;
