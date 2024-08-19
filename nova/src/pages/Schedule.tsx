import React from "react";
import { Button, Calendar, Dialog, messages } from "@litespace/luna";
import { useIntl } from "react-intl";

const Schedule: React.FC = () => {
  const intl = useIntl();
  return (
    <div className="w-full overflow-hidden max-w-screen-2xl mx-auto px-4 pb-12 pt-10">
      <Dialog title={"title"} trigger={"open me"} />
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl mb-5">
          {intl.formatMessage({
            id: messages["page.schedule.title"],
          })}
        </h1>

        <div>
          <Button>
            {intl.formatMessage({
              id: messages["global.labels.edit"],
            })}
          </Button>
        </div>
      </div>

      <Calendar />
    </div>
  );
};

export default Schedule;
