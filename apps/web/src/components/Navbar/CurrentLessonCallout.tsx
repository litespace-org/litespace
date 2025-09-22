import React from "react";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

type Props = {
  tutorName: string | null;
  onJoin: () => void;
};

const CurrentLessonCallout: React.FC<Props> = ({ tutorName, onJoin }) => {
  const intl = useFormatMessage();
  const name = tutorName || intl("navbar.lesson-now.unknown-tutor");

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row-reverse md:items-center md:gap-4">
      <Button size="large" className="md:w-auto" onClick={onJoin}>
        <Typography
          tag="span"
          className="text-body font-medium text-natural-50"
        >
          {intl("navbar.lesson-now.enter")}
        </Typography>
      </Button>
      <Typography
        tag="span"
        className="text-natural-700 text-caption font-semibold text-center md:text-right"
      >
        {intl("navbar.lesson-now.message", { tutor: name })}
      </Typography>
    </div>
  );
};

export default CurrentLessonCallout;
