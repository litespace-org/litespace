import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { MultiSelect } from "@litespace/luna/MultiSelect";
import { Typography } from "@litespace/luna/Typography";
import React from "react";

export const TopicSelector: React.FC<{
  allTopics: {
    value: number;
    label: string;
  }[];
  topics: number[];
  setTopics: (topics: number[]) => void;
}> = ({ allTopics, setTopics, topics }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-6">
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("settings.edit.personal.topics.title")}
      </Typography>
      <div className="flex flex-col gap-2">
        <Typography element="subtitle-2" className="text-natural-950">
          {intl("settings.edit.personal.topics")}
        </Typography>

        <MultiSelect
          setValues={setTopics}
          options={allTopics}
          values={topics}
        />
      </div>
    </div>
  );
};
export default TopicSelector;
