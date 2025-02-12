import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { MultiSelect } from "@litespace/ui/MultiSelect";
import { Typography } from "@litespace/ui/Typography";
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
    <div className="flex grow flex-col gap-4 mt-2">
      <Typography
        element={"subtitle-2"}
        weight="bold"
        className="text-natural-950"
      >
        {intl("settings.edit.personal.topics.title")}
      </Typography>

      <MultiSelect
        setValues={setTopics}
        options={allTopics}
        values={topics}
        placeholder={intl("settings.topics.placeholder")}
      />
    </div>
  );
};
export default TopicSelector;
