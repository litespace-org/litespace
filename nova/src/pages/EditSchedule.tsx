import AddSlots from "@/components/AddSlots";
import { Button, ButtonSize, messages } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";

const EditSchedule: React.FC = () => {
  const intl = useIntl();
  return (
    <div className="w-full overflow-hidden max-w-screen-2xl mx-auto px-4 pb-12 pt-10">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-4xl mb-5">
          {intl.formatMessage({
            id: messages["page.schedule.title"],
          })}
        </h1>

        <div>
          <AddSlots />
        </div>
      </div>
    </div>
  );
};

export default EditSchedule;
