import { Alert, AlertType } from "@litespace/ui/Alert";
import { useWebFormatMessage } from "@/hooks/intl";
import React from "react";

const Error: React.FC<{
  refetch: () => void;
  disabled: boolean;
  loading: boolean;
}> = ({ refetch, loading, disabled }) => {
  const intl = useWebFormatMessage();
  return (
    <Alert
      type={AlertType.Error}
      title={intl("invoices.list.error")}
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
