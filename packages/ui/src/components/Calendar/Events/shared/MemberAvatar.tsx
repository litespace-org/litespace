import React from "react";
import { Avatar } from "@/components/Avatar";

export const MemberAvatar: React.FC<{
  src: string | null;
  alt: string | null;
  seed: string;
}> = ({ src, alt, seed }) => {
  return (
    <div className="shrink-0 w-[35px] h-[35px] rounded-full overflow-hidden">
      <Avatar src={src} alt={alt} seed={seed} object="cover" />
    </div>
  );
};
