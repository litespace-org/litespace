import { Alert, AlertType } from "@litespace/luna/Alert";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const Error: React.FC<{
  refetch: () => void;
  disabled: boolean;
  loading: boolean;
}> = ({ refetch, loading, disabled }) => {
  const intl = useFormatMessage();
  return (
    <Alert
      type={AlertType.Error}
      title={intl("invoices.stats.error")}
      action={{
        label: intl("global.labels.retry"),
        onClick: refetch,
        disabled,
        loading,
      }}
    />
  );
};

export default Error;
