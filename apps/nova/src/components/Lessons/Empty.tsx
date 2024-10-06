import { Route } from "@/types/routes";
import { Button, ButtonSize, Card, messages } from "@litespace/luna";
import { IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";

const Empty: React.FC<{ role: IUser.Role }> = ({ role }) => {
  const intl = useIntl();

  const tutor = useMemo(() => role === IUser.Role.Tutor, [role]);
  const student = useMemo(() => role === IUser.Role.Student, [role]);
  if (!tutor && !student) return null;

  return (
    <Card className="flex flex-col items-center justify-center gap-1.5 py-8">
      <h3 className="text-foreground text-xl font-semibold">
        {intl.formatMessage({
          id: messages["page.lessons.empty.title"],
        })}
      </h3>

      <p className="text-foreground-light text-sm">
        {intl.formatMessage({
          id: tutor
            ? messages["page.lessons.empty.tutor.description"]
            : messages["page.lessons.empty.student.description"],
        })}
      </p>

      <Link
        to={tutor ? Route.EditSchedule : Route.Tutors}
        className="inline-block mt-1"
      >
        <Button size={ButtonSize.Small}>
          {intl.formatMessage({
            id: tutor
              ? messages["page.lessons.empty.tutor.action"]
              : messages["page.lessons.empty.student.action"],
          })}
        </Button>
      </Link>
    </Card>
  );
};

export default Empty;
