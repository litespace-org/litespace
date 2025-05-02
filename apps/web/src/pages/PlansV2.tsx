import { Content } from "@/components/PlansV2/Content";
import React from "react";
import { usePlans } from "@litespace/headless/plans";
import { useOnError } from "@/hooks/error";

const PlansV2: React.FC = () => {
  const { query, keys } = usePlans();

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  return (
    <div className="w-full p-4 md:p-6 mx-auto max-w-screen-3xl">
      <Content
        loading={query.isLoading}
        error={query.isError}
        refetch={query.refetch}
        list={query.data?.list || []}
      />
    </div>
  );
};

export default PlansV2;
