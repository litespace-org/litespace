import React from "react";
import { Dayjs } from "dayjs";
import { Void } from "@litespace/types";

import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import Calendar from "@litespace/assets/Calendar";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";

interface Props {
  date: Dayjs;
  nextWeek: Void;
  prevWeek: Void;
  manageSchedule: Void;
}

const Header: React.FC<Props> = ({
  date,
  nextWeek,
  prevWeek,
  manageSchedule,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-row justify-between items-center gap-6">
      <div>
        <Typography
          element="subtitle-2"
          weight="bold"
          className="text-natural-950 mb-2"
        >
          {date.format("YYYY MMMM")}
        </Typography>
        <Typography
          element="body"
          weight="semibold"
          className="text-natural-700"
        >
          {date.startOf("week").format("DD MMMM YYYY")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM YYYY")}
        </Typography>
      </div>

      <div className="flex tw-flex-row gap-4 items-center justify-center">
        <button onClick={prevWeek} type="button">
          <ArrowRight className="[&>*]:stroke-brand-700" />
        </button>
        <Typography element="body" weight="bold" className="text-natural-950">
          {date.startOf("week").format("DD MMMM")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM")}
        </Typography>
        <button onClick={nextWeek} type="button">
          <ArrowLeft className="[&>*]:stroke-brand-700" />
        </button>
      </div>

      <Button
        size={"small"}
        endIcon={<Calendar className="[&>*]:tw-stroke-natural-50 h-6 w-6" />}
        onClick={manageSchedule}
        htmlType="button"
      >
        {intl("manage-schedule.edit-or-add-schedule")}
      </Button>
    </div>
  );
};

export default Header;
