import React from "react";
import { Dayjs } from "dayjs";
import { Void } from "@litespace/types";

import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useWebFormatMessage } from "@/hooks/intl";

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
  const intl = useWebFormatMessage();

  return (
    <div className="flex flex-row justify-between items-center gap-6">
      <div>
        <Typography
          tag="span"
          className="text-natural-950 mb-2 text-subtitle-2 font-bold"
        >
          {date.format("YYYY MMMM")}
        </Typography>
        <Typography
          tag="span"
          className="text-natural-700 text-body font-semibold"
        >
          {date.startOf("week").format("DD MMMM YYYY")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM YYYY")}
        </Typography>
      </div>

      <div className="flex tw-flex-row gap-4 items-center justify-center">
        <button onClick={prevWeek} type="button">
          <ArrowRight className="[&>*]:stroke-brand-700" />
        </button>
        <Typography tag="span" className="text-natural-950 text-body font-bold">
          {date.startOf("week").format("DD MMMM")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM")}
        </Typography>
        <button onClick={nextWeek} type="button">
          <ArrowLeft className="[&>*]:stroke-brand-700" />
        </button>
      </div>

      <Button
        size="large"
        endIcon={<Calendar className="[&>*]:tw-stroke-natural-50" />}
        onClick={manageSchedule}
        htmlType="button"
      >
        {intl("manage-schedule.edit-or-add-schedule")}
      </Button>
    </div>
  );
};

export default Header;
