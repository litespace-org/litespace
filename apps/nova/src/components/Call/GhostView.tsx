import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { RemoteStream } from "@litespace/headless/sessions";
import { isEmpty } from "lodash";
import React from "react";
import UserMedia from "@/components/Call/UserMedia";

const GhostView: React.FC<{ streams: RemoteStream[] }> = ({ streams }) => {
  const intl = useFormatMessage();

  if (isEmpty(streams))
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Typography element="subtitle-1">{intl("call.empty")}</Typography>
      </div>
    );

  return (
    <div className="grid grid-cols-12 grid-rows-12">
      {streams.map(({ stream }) => (
        <div key={stream.id} className="col-span-6 row-span-6">
          <UserMedia stream={stream} />
        </div>
      ))}
    </div>
  );
};

export default GhostView;
