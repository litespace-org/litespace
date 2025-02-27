import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";

export const MemberAvatar: React.FC<{
  src: string | null;
  alt: string | null;
  seed: string;
}> = ({ src, alt, seed }) => {
  return (
    <div className="shrink-0 w-[35px] h-[35px] rounded-full overflow-hidden">
      <Avatar src={orUndefined(src)} alt={orUndefined(alt)} seed={seed} />
    </div>
  );
};
