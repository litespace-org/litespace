import React from "react";
import cn from "classnames";

export function RawHtml({ html }: { html: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        "mb-5 max-w-screen-md",
        "[&_h3]:text-2xl [&_h3]:text-foreground [&_h3]:pb-2 [&_h3]:mt-5",
        "[&_p]:text-foreground-light [&_p]:mb-4 [&_p]:text-base [&_p]:leading-loose",
        "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:pr-4",
        "[&_ul_li]:text-foreground-light [&_ul_li]:mb-2"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default RawHtml;
