import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";

export const MemberAvatar: React.FC<{
  src: string | null;
  alt: string | null;
  seed: string;
}> = ({ src, alt, seed }) => {
  return (
    <div className="tw-shrink-0 tw-w-[35px] tw-h-[35px] tw-rounded-full tw-overflow-hidden">
      <Avatar src={orUndefined(src)} alt={orUndefined(alt)} seed={seed} />
    </div>
  );
};
