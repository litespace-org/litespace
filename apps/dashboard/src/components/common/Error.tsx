import { Alert } from "@litespace/luna/components/Alert";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Void } from "@litespace/types";
import React from "react";

const Error: React.FC<{ title: string; error: Error; refetch: Void }> = ({
  title,
  error,
  refetch,
}) => {
  const intl = useFormatMessage();

  return (
    <Alert
      title={title}
      action={{
        label: intl("global.labels.reload.page"),
        onClick: refetch,
      }}
    >
      {error.message}
    </Alert>
  );
};

export default Error;
