import Selector from "@/components/PlansV2/Selector";
import { IPlan } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { Typography } from "@litespace/ui/Typography";
import { UseQueryResult } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import React from "react";

export const Content: React.FC<{
  plans: UseQueryResult<IPlan.FindPlansApiResponse, Error>;
}> = ({ plans }) => {
  const intl = useFormatMessage();

  if (plans.isLoading)
    return <Loader size="large" text={intl("plans.loading")} />;

  if (plans.isError || isEmpty(plans.data?.list))
    return (
      <LoadingError error={intl("plans.error")} retry={() => plans.refetch()} />
    );

  if (!plans.data) return null;

  return (
    <div>
      <Typography
        tag="h3"
        className="text-caption md:text-subtitle-1 lg:text-h3 font-semibold text-natural-950 mb-2 md:mb-4 text-center"
      >
        {intl("plans.header.title")}
      </Typography>
      <Typography
        tag="h5"
        className="text-tiny md:text-body lg:text-subtitle-1 font-normal md:font-semibold text-natural-600 mb-6 md:mb-10 lg:mb-6 text-center"
      >
        {intl("plans.header.description")}
      </Typography>
      <Selector plans={plans.data.list} />
    </div>
  );
};

export default Content;
