import React from "react";
import Search from "@litespace/assets/Search";
import { useFormatMessage } from "@/hooks";

export const SearchInput = () => {
  const intl = useFormatMessage();
  return (
    <div className="tw-border tw-rounded-full tw-border-natural-400 tw-flex tw-gap-2 tw-items-center tw-h-[40px] tw-px-2 tw-w-[386px]">
      <Search className="tw-text-natural-400" />
      <input
        placeholder={intl("global.search")}
        className="tw-text-base tw-font-[500] tw-bg-transparent tw-text-natural-400 tw-grow focus:tw-outline-none"
      />
    </div>
  );
};
