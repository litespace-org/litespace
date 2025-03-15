import React from "react";
import { Dayjs } from "dayjs";
import { Void } from "@litespace/types";

import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import Calendar from "@litespace/assets/Calendar";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

interface Props {
  start: Dayjs;
  end: Dayjs;
  next: Void;
  prev: Void;
  manageSchedule: Void;
}

const Header: React.FC<Props> = ({
  start,
  end,
  next,
  prev,
  manageSchedule,
}) => {
  const { md, lg } = useMediaQuery();
  const intl = useFormatMessage();

  return (
    <div className="bg-natural-50 md:bg-transparent rounded-b-3xl md:rounded-none shadow-header md:shadow-[none] -m-4 p-4 md:m-0 md:p-0 relative flex flex-col md:flex-row justify-between md:items-center gap-6">
      <div>
        <Typography
          tag="h2"
          className="text-natural-950 mb-3 md:mb-2 text-body lg:text-subtitle-2 font-bold"
        >
          {start.format("MMMM YYYY")}
        </Typography>
        <Typography
          tag="p"
          className="text-natural-700 text-caption lg:text-body font-semibold"
        >
          {start.format("DD MMMM")}
          {" - "}
          {end.subtract(1, "day").format("DD MMMM")}
        </Typography>
      </div>

      <div className="flex flex-row gap-4 items-center justify-between md:justify-center">
        <button onClick={prev} type="button">
          <ArrowRight className="[&>*]:stroke-brand-700 w-6 h-6" />
        </button>
        <Typography
          tag="span"
          className="text-natural-950 text-caption lg:text-body font-bold"
        >
          {start.format("DD MMMM")}
          {" - "}
          {end.subtract(1, "day").format("DD MMMM")}
        </Typography>
        <button onClick={next} type="button">
          <ArrowLeft className="w-6 h-6 [&>*]:stroke-brand-700" />
        </button>
      </div>

      <div className="absolute md:relative top-4 left-4 md:top-0 md:left-0">
        <Button
          size={lg ? "large" : md ? "medium" : "small"}
          endIcon={<Calendar className="[&>*]:stroke-natural-50 icon" />}
          onClick={manageSchedule}
          htmlType="button"
        >
          <Typography
            tag="span"
            className="text-caption md:text-body text-natural-50 font-medium"
          >
            {intl("manage-schedule.edit-or-add-schedule")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

export default Header;
