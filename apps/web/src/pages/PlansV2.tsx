import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Content } from "@/components/PlansV2/Content";
import React from "react";
import { usePlans } from "@litespace/headless/plans";

const PlansV2: React.FC = () => {
  const intl = useFormatMessage();
  const plans = usePlans();

  return (
    <div className="w-full p-4 md:p-6 mx-auto max-w-screen-3xl">
      <PageTitle title={intl("plans.title")} className="mb-4 md:mb-6" />
      <Content plans={plans} />
    </div>
  );
};

export default PlansV2;
