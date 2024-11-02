import RuleForm from "@/components/RuleForm";
import Rules from "@/components/Rules";
import { useRender } from "@/hooks/render";
import { Button, ButtonSize } from "@litespace/luna/components/Button";
import { messages } from "@litespace/luna/locales";
import React from "react";
import { useIntl } from "react-intl";

const EditSchedule: React.FC = () => {
  const intl = useIntl();
  const { open, show, hide } = useRender();

  return (
    <div className="w-full px-4 pt-10 pb-12 mx-auto overflow-hidden max-w-screen-2xl">
      <div className="flex flex-row items-center justify-between">
        <h1 className="mb-5 text-4xl">
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
