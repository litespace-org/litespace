import { Input } from "@/components/Input";
import { useFormatMessage } from "@/hooks";
import Search from "@litespace/assets/Search";
import React, { useCallback, useEffect, useState } from "react";

const SearchInput: React.FC<{
  onSearch?: (value: string) => void;
}> = ({ onSearch }) => {
  const intl = useFormatMessage();
  const [value, setValue] = useState<string>("");

  const onSubmit = useCallback(() => {
    if (!onSearch || !value) return;
    onSearch(value);
    setValue("");
  }, [onSearch, value]);

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Enter") onSubmit();
    },
    [onSubmit]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);

  return (
    <div>
      <Input
        startActions={[
          {
            id: 1,
            Icon: Search,
            onClick: onSubmit,
            className: "tw-mr-[18px] [&>svg>*]:tw-stroke-natural-400",
          },
        ]}
        className="tw-px-8 tw-bg-transparent !tw-rounded-full"
        placeholder={intl("navbar.search.placeholder")}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
    </div>
  );
};

export default SearchInput;
