import React from "react";
import Image from "@/components/Settings/Image";
import Video from "@/components/Profile/Video";
import { RefreshUser } from "@/hooks";

const Media: React.FC<{
  refresh: RefreshUser;
  displayOnly: boolean;
  user?: number;
  image?: string | null;
  video?: string | null;
  name?: string | null;
}> = ({ refresh, displayOnly, user, name, video, image }) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-4 tw-w-full tw-max-w-[20rem] mx-auto sm:tw-max-w-none sm:tw-w-52 md:tw-w-80 tw-shrink-0">
      <Image
        refresh={refresh}
        displayOnly={displayOnly}
        user={user}
        image={image}
      />

      <Video video={video} name={name} />
    </div>
  );
};

export default Media;
