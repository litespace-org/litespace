import React from "react";
import RecordsCount from "@/components/Common/RecordsCount";
import { Spinner } from "@litespace/ui/Spinner";
import cn from "classnames";
import { Typography } from "@litespace/ui/Typography";
import { Link } from "react-router-dom";
import Info from "@litespace/assets/InfoCircle";

const PageTitle: React.FC<{
  title: string;
  fetching?: boolean;
  count?: number;
  url?: string;
}> = ({ title, fetching, count, url }) => {
  return (
    <div className="flex flex-row gap-1 items-center">
      <Link
        data-url={!!url}
        to={url || "#"}
        className="hidden data-[url=true]:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md"
        target="_blank"
      >
        <Info className="[&>*]:stroke-natural-950 w-6 h-6" />
      </Link>

      <div className={cn("flex flex-row items-center gap-4")}>
        <Typography
          tag="h1"
          className="text-subtitle-2 font-bold text-natural-950"
        >
          {title}
          &nbsp;
          {count ? <RecordsCount count={count} /> : null}
        </Typography>
        {fetching ? <Spinner /> : null}
      </div>
    </div>
  );
};

export default PageTitle;
