import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { MultiSelect } from "@litespace/luna/MultiSelect";
import { Typography } from "@litespace/luna/Typography";
import React from "react";
import { Loader } from "@litespace/luna/Loading";

export const TopicSelector: React.FC<{
  allTopics: {
    value: number;
    label: string;
  }[];
  userTopics: number[];
  loading?: boolean;
  onChange: (topics: number[]) => void;
}> = ({ allTopics, userTopics, loading, onChange }) => {
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
        {loading ? (
          <div className="mt-2">
            <Loader />
          </div>
        ) : null}
        <MultiSelect
          setValues={onChange}
          options={allTopics}
          values={userTopics}
        />
      </div>
    </div>
  );
};
export default TopicSelector;
