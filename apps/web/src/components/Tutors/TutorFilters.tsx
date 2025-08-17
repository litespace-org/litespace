import React from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

export type TutorFiltersProps = {
  selected: string;
  onSelect: (filter: string) => void;
};

const TutorFilters: React.FC<TutorFiltersProps> = ({ selected, onSelect }) => {
  const intl = useFormatMessage();

  return (
    // filter button group
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <Button
        htmlType="button"
        type="natural"
        size="large"
        className={`border border-natural-200 transition-colors ${
          selected === "recommended"
            ? "bg-natural-500 text-white"
            : "bg-white text-natural-700 hover:bg-natural-500 hover:text-white"
        }`}
        onClick={() => onSelect("recommended")}
      >
        {intl("tutors.filters.recommended")}
      </Button>

      <Button
        htmlType="button"
        type="natural"
        size="large"
        className={`border border-natural-200 transition-colors ${
          selected === "available_now"
            ? "bg-natural-500 text-white"
            : "bg-white text-natural-700 hover:bg-natural-500 hover:text-white"
        }`}
        onClick={() => onSelect("available_now")}
      >
        {intl("tutors.filters.available_now")}
      </Button>

      <Button
        htmlType="button"
        type="natural"
        size="large"
        className={`border border-natural-200 transition-colors ${
          selected === "male"
            ? "bg-natural-500 text-white"
            : "bg-white text-natural-700 hover:bg-natural-500 hover:text-white"
        }`}
        onClick={() => onSelect("male")}
      >
        {intl("tutors.filters.male")}
      </Button>

      <Button
        htmlType="button"
        type="natural"
        size="large"
        className={`border border-natural-200 transition-colors ${
          selected === "female"
            ? "bg-natural-500 text-white"
            : "bg-white text-natural-700 hover:bg-natural-500 hover:text-white"
        }`}
        onClick={() => onSelect("female")}
      >
        {intl("tutors.filters.female")}
      </Button>

      <Button
        htmlType="button"
        type="natural"
        size="large"
        className={`border border-natural-200 transition-colors ${
          selected === "rating_4_plus"
            ? "bg-natural-500 text-white"
            : "bg-white text-natural-700 hover:bg-natural-500 hover:text-white"
        }`}
        onClick={() => onSelect("rating_4_plus")}
      >
        {intl("tutors.filters.rating_4_plus")}
      </Button>


    </div>
  );
};

export default TutorFilters;
