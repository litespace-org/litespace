import { Route } from "@/types/routes";
import { Button, ButtonSize, Card, messages } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";

const Empty: React.FC = () => {
  const intl = useIntl();
  return (
    <Card className="flex items-center justify-center flex-col gap-2">
      <h3 className="text-lg text-foreground">
        {intl.formatMessage({
          id: messages["page.interviews.empty.title"],
        })}
      </h3>
      <p className="text-foreground-light">
        {intl.formatMessage({
          id: messages["page.interviews.empty.desc"],
        })}
      </p>

      <div>
        <Link to={Route.EditSchedule}>
          <Button size={ButtonSize.Small}>
            {intl.formatMessage({
              id: messages["page.interviews.empty.action"],
            })}
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default Empty;
