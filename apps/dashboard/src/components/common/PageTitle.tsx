import React from "react";
import RecordsCount from "@/components/common/RecordsCount";
import { Spinner } from "@litespace/luna/Spinner";
import cn from "classnames";

const PageTitle: React.FC<{
  title: string;
  fetching: boolean;
  count?: number;
  variant?: "primary" | "secondary";
  className?: string;
}> = ({ title, fetching, count, className, variant = "primary" }) => {
  return (
    <div className={cn("flex flex-row items-center gap-4", className)}>
      <h1
        className={`${variant === "primary" ? "text-2xl" : ""} ${
          variant === "secondary" ? "text-xl" : ""
        }`}
      >
        {title}
        &nbsp;
        {count ? <RecordsCount count={count} /> : null}
      </h1>

      {fetching ? <Spinner /> : null}
    </div>
  );
};

export default PageTitle;
