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
        "tw-@container",
        // plain text styles
        "tw-text-foreground-semi tw-text-caption @sm:tw-text-base",
        // heading styles
        "[&_h3]:tw-text-foreground [&_h3]:tw-pb-2",
        "[&_h3]:tw-text-lg @xs:[&_h3]:tw-text-subtitle-2 @md:[&_h3]:tw-text-subtitle-1 [&_h3]:tw-font-semibold",
        // paragraph styles
        "[&_p]:tw-text-foreground-light [&_p]:tw-mb-4 [&_p]:tw-text-base [&_p]:tw-leading-loose",
        // list styles
        "[&_ul]:tw-list-disc [&_ul]:tw-list-inside [&_ul]:tw-pr-4",
        "[&_ul_li]:tw-text-foreground-light [&_ul_li]:tw-mb-2",
        "[&_font]:tw-text-foreground [&_li]:!tw-text-foreground"
      )}
      dangerouslySetInnerHTML={innerHtml}
    >
      {children}
    </div>
  );
};

export default RawHtml;
