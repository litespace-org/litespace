import React from "react";
import { AvatarV2 } from "@/components/Avatar";

export const MemberAvatar: React.FC<{
  src: string | null;
  alt: string | null;
  id: number;
}> = ({ src, alt, id }) => {
  return (
    <div className="shrink-0 w-[35px] h-[35px] rounded-full overflow-hidden">
      <AvatarV2 src={src} alt={alt} id={id} object="cover" />
    </div>
  );
};
