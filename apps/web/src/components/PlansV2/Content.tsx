import Selector from "@/components/PlansV2/Selector";
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

  if (loading) return <Loading size="large" text={intl("plans.loading")} />;

  if (error || isEmpty(list))
    return <LoadingError error={intl("plans.error")} retry={refetch} />;

  return (
    <div className="mt-4 md:mt-6">
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
      <Selector plans={list} />
    </div>
  );
};

export default Content;
