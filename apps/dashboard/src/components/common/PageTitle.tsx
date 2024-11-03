import React from "react";
import RecordsCount from "@/components/common/RecordsCount";
import { Spinner } from "@litespace/luna/Spinner";

const PageTitle: React.FC<{
  title: string;
  fetching: boolean;
  count?: number;
}> = ({ title, fetching, count }) => {
  return (
    <div className="flex flex-row items-center gap-4">
      <h1 className="text-2xl">
        {title}
        &nbsp;
        {count ? <RecordsCount count={count} /> : null}
      </h1>

      {fetching ? <Spinner /> : null}
    </div>
  );
};

export default PageTitle;
