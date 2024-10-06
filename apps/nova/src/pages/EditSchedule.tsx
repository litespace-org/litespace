import RuleForm from "@/components/RuleForm";
import Rules from "@/components/Rules";
import { useRender } from "@/hooks/render";
import { Button, ButtonSize, messages } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";

const EditSchedule: React.FC = () => {
  const intl = useIntl();
  const { open, show, hide } = useRender();

  return (
    <div className="w-full overflow-hidden max-w-screen-2xl mx-auto px-4 pb-12 pt-10">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-4xl mb-5">
          {intl.formatMessage({
            id: messages["global.labels.my-schedule"],
          })}
        </h1>

        <div>
          <Button onClick={show} size={ButtonSize.Small}>
            {intl.formatMessage({
              id: messages["page.schedule.add"],
            })}
          </Button>
          <RuleForm open={open} close={hide} />
        </div>
      </div>

      <div className="mt-8">
        <Rules />
      </div>
    </div>
  );
};

export default EditSchedule;
