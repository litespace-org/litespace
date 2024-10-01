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
    <div className="flex flex-col gap-4 w-full sm:w-40 md:w-80 shrink-0">
      <Image
        refresh={refresh}
        displayOnly={displayOnly}
        user={user}
        image={image}
        className=""
      />

      <Video video={video} name={name} />
    </div>
  );
};

export default Media;
