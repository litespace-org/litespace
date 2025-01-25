import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useMediaQueries } from "@litespace/luna/hooks/media";
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
  const { lg } = useMediaQueries();
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Typography
        element={lg ? "subtitle-1" : "caption"}
        weight="bold"
        className="text-natural-950"
      >
        {intl("settings.edit.personal.topics.title")}
      </Typography>
      <div className="flex flex-col gap-2">
        <Typography
          element="subtitle-2"
          weight="regular"
          className="text-natural-950"
        >
          {intl("settings.edit.personal.topics")}
        </Typography>

        <MultiSelect
          setValues={setTopics}
          options={allTopics}
          values={topics}
          placeholder={intl("settings.topics.placeholder")}
        />
      </div>
    </div>
  );
};
export default TopicSelector;
