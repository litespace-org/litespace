import { Input } from "@/components/Input";
import Search from "@litespace/assets/Search";
import React from "react";

const SearchInput: React.FC = () => {
  return (
    <div>
      <Input
        startActions={[{ id: 1, Icon: Search, onClick: () => {} }]}
        className="!tw-w-[386px] tw-px-8 tw-bg-transparent !tw-rounded-full"
      />
    </div>
  );
};

export default SearchInput;
