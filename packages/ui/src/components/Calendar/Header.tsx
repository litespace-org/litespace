import { Typography } from "@/components/Typography";
import { Dayjs } from "dayjs";
import React from "react";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { Void } from "@litespace/types";

interface Props {
  date: Dayjs;
  nextWeek: Void;
  prevWeek: Void;
}

const Header: React.FC<Props> = ({ date, nextWeek, prevWeek }) => {
  return (
    <div>
      <Typography
        tag="span"
        className="text-natural-950 mb-2 text-subtitle-2 font-bold"
      >
        {date.format("YYYY MMMM")}
      </Typography>
      <div className="flex flex-row justify-between items-center">
        <Typography
          tag="span"
          className="text-natural-700 text-body font-semibold"
        >
          {date.startOf("week").format("DD MMMM YYYY")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM YYYY")}
        </Typography>
        <div className="flex flex-row gap-4 items-center justify-center">
          <button onClick={prevWeek} type="button">
            <ArrowRight className="[&>*]:stroke-brand-700 w-6 h-6" />
          </button>
          <Typography
            tag="span"
            className="text-natural-950 text-body font-bold"
          >
            {date.startOf("week").format("DD MMMM")}&nbsp;-&nbsp;
            {date.endOf("week").format("DD MMMM")}
          </Typography>
          <button onClick={nextWeek} type="button">
            <ArrowLeft className="w-6 h-6 [&>*]:stroke-brand-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
