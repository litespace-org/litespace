import React, { useMemo } from "react";
import cn from "classnames";

export const RawHtml: React.FC<{
  html?: string;
  children?: React.ReactNode;
  editor?: boolean;
}> = ({ html, children, editor }) => {
  const innerHtml = useMemo(() => {
    if (!html) return;
    return { __html: html };
  }, [html]);

  return (
    <div
      dir="auto"
      className={cn(
        "[&_h3]:text-xl [&_h3]:text-foreground [&_h3]:pb-2",
        "[&_p]:text-foreground-light [&_p]:mb-4 [&_p]:text-base [&_p]:leading-loose",
        "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:pr-4",
        "[&_ul_li]:text-foreground-light [&_ul_li]:mb-2",
        "[&_font]:text-foreground [&_li]:!text-foreground",
        !editor && "[&_br]:hidden"
      )}
      dangerouslySetInnerHTML={innerHtml}
    >
      {children}
    </div>
  );
};

export default RawHtml;
