import Selector from "@/components/Plans/Selector";
import { IPlan, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { Typography } from "@litespace/ui/Typography";
import { isEmpty } from "lodash";
import React from "react";

export const Content: React.FC<{
  loading: boolean;
  error: boolean;
  list: IPlan.Self[];
  refetch: Void;
}> = ({ loading, error, list, refetch }) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="mx-auto mt-[15vh]">
        <Loading size="large" text={intl("plans.loading")} />
      </div>
    );

  if (error || isEmpty(list))
    return (
      <div className="w-fit mx-auto mt-[15vh]">
        <LoadingError error={intl("plans.error")} retry={refetch} />
      </div>
    );

  return (
    <>
      <Typography
        tag="h2"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold mb-4 md:mb-6"
      >
        {intl("plans.title")}
      </Typography>
      <div>
        <Typography
          tag="h3"
          className="text-caption md:text-subtitle-1 lg:text-h4 xl:text-h3 font-semibold text-natural-950 mb-2 md:mb-4 text-center"
        >
          {intl("plans.header.title")}
        </Typography>

        <Typography
          tag="h5"
          className="text-tiny md:text-body text-center text-natural-600 lg:text-natural-700 font-normal md:font-semibold mb-6 md:mb-10 lg:mb-10"
        >
          {intl("plans.header.description")}
        </Typography>

        <Selector plans={list} />
      </div>
    </>
  );
};

export default Content;
