import { Content } from "@/components/Plans/Content";
import React from "react";
import { usePlans } from "@litespace/headless/plans";
import { useOnError } from "@/hooks/error";

const Plans: React.FC = () => {
  const { query } = usePlans({
    active: true,
    forInvitesOnly: false,
    full: true,
  });

  useOnError({
    type: "query",
    error: query.error,
    keys: query.keys,
  });

  return (
    <div className="w-full p-4 md:p-4 lg:p-6 mx-auto max-w-screen-3xl">
      <Content
        loading={query.isLoading}
        error={query.isError}
        refetch={query.refetch}
        list={query.data?.list || []}
      />
    </div>
  );
};

export default Plans;
