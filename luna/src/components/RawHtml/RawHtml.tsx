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
        "[&_h3]:tw-text-xl [&_h3]:tw-text-foreground [&_h3]:tw-pb-2",
        "[&_p]:tw-text-foreground-light [&_p]:tw-mb-4 [&_p]:tw-text-base [&_p]:tw-leading-loose",
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
