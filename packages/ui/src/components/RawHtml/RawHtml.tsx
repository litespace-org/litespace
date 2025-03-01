import React, { useMemo } from "react";
import cn from "classnames";

const startBreaks = /^(<div><br><\/div>|<br>)+/;
const endBreaks = /(<div><br><\/div>|<br>)+$/;

export const RawHtml: React.FC<{
  html?: string;
  children?: React.ReactNode;
}> = ({ html, children }) => {
  const innerHtml = useMemo(() => {
    if (!html) return;
    return { __html: html.replace(startBreaks, "").replace(endBreaks, "") };
  }, [html]);

  return (
    <div
      dir="auto"
      className={cn(
        "@container",
        // plain text styles
        "text-foreground-semi text-caption @sm:text-base",
        // heading styles
        "[&_h3]:text-foreground [&_h3]:pb-2",
        "[&_h3]:text-lg @xs:[&_h3]:text-subtitle-2 @md:[&_h3]:text-subtitle-1 [&_h3]:font-semibold",
        // paragraph styles
        "[&_p]:text-foreground-light [&_p]:mb-4 [&_p]:text-base [&_p]:leading-loose",
        // list styles
        "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:pr-4",
        "[&_ul_li]:text-foreground-light [&_ul_li]:mb-2",
        "[&_font]:text-foreground [&_li]:!text-foreground"
      )}
      dangerouslySetInnerHTML={innerHtml}
    >
      {children}
    </div>
  );
};

export default RawHtml;
