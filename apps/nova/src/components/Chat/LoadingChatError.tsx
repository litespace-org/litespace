import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { LoadingError } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";
import React from "react";

export const LoadingChatError: React.FC<{ retry: Void }> = ({ retry }) => {
  const intl = useFormatMessage();

  return (
    <div className="w-full min-h-screen overflow-hidden flex flex-col gap-[157px] p-6">
      <Typography
        weight="bold"
        element="subtitle-2"
        className="text-natural-950 mb-6"
      >
        {intl("chat.title")}
      </Typography>
      <div>
        <LoadingError
          variant="large"
          error={intl("chat.error")}
          retry={retry}
        />
      </div>
    </div>
  );
};
