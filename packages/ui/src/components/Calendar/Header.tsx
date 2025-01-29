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
        element="subtitle-2"
        weight="bold"
        className="tw-text-natural-950 tw-mb-2"
      >
        {date.format("YYYY MMMM")}
      </Typography>
      <div className="tw-flex tw-flex-row tw-justify-between tw-items-center">
        <Typography
          element="body"
          weight="semibold"
          className="tw-text-natural-700"
        >
          {date.startOf("week").format("DD MMMM YYYY")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM YYYY")}
        </Typography>
        <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center tw-justify-center">
          <button onClick={prevWeek} type="button">
            <ArrowRight className="[&>*]:tw-stroke-brand-700" />
          </button>
          <Typography
            element="body"
            weight="bold"
            className="tw-text-natural-950"
          >
            {date.startOf("week").format("DD MMMM")}&nbsp;-&nbsp;
            {date.endOf("week").format("DD MMMM")}
          </Typography>
          <button onClick={nextWeek} type="button">
            <ArrowLeft className="[&>*]:tw-stroke-brand-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
