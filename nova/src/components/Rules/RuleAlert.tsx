import { Alert, messages } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";

const RuleAlert: React.FC = () => {
  const intl = useIntl();
  return (
    <div>
      <Alert
        title={intl.formatMessage({
          id: messages["page.schedule.update.alert.title"],
        })}
      >
        <p>
          {intl.formatMessage({
            id: messages["page.schedule.update.alert.description"],
          })}
        </p>
      </Alert>
    </div>
  );
};

export default RuleAlert;
