import { Alert } from "@litespace/ui/Alert";
import { useWebFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";
import React from "react";

const Error: React.FC<{ title: string; error: Error; refetch: Void }> = ({
  title,
  error,
  refetch,
}) => {
  const intl = useWebFormatMessage();

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
