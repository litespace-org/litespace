import { useReload } from "@/hooks/common";
import { Alert } from "@litespace/luna/Alert";
import { messages } from "@litespace/luna/locales";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const LessonError: React.FC<{ error: unknown }> = ({ error }) => {
  const intl = useIntl();
  const reload = useReload();
  const action = useMemo(() => {
    return {
      label: intl.formatMessage({
        id: messages["global.labels.reload.page"],
      }),
      onClick: reload,
    };
  }, [intl, reload]);

  return (
    <Alert
      title={intl.formatMessage({
        id: messages["error.unexpected"],
      })}
      action={action}
    >
      {error instanceof Error ? error.message : null}
    </Alert>
  );
};

export default LessonError;
