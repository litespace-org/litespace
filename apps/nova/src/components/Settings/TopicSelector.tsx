import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { MultiSelect } from "@litespace/luna/MultiSelect";
import { Typography } from "@litespace/luna/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { Loader } from "@litespace/luna/Loading";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { isEqual } from "lodash";

export const TopicSelector: React.FC<{
  setSubmitFlag: (props: { userData: boolean; topics: boolean }) => void;
  submitFlag: { userData: boolean; topics: boolean };
}> = ({ setSubmitFlag, submitFlag }) => {
  const intl = useFormatMessage();

  const [topics, setTopics] = useState<number[]>([]);
  const allTopicsQuery = useTopics({});
  const userTopicsQuery = useUserTopics();

  const allTopics = useMemo(() => {
    if (!allTopicsQuery.query.data?.list) return [];
    return allTopicsQuery.query.data.list.map((topic) => ({
      value: topic.id,
      label: topic.name.en,
    }));
  }, [allTopicsQuery]);

  const userTopics = useMemo(() => {
    if (!userTopicsQuery.data) return [];
    return userTopicsQuery.data.map((topic) => topic.id);
  }, [userTopicsQuery.data]);

  useEffect(() => {
    setTopics(userTopics);
  }, [userTopics]);

  useEffect(() => {
    if (!isEqual(userTopics, topics))
      return setSubmitFlag({ userData: submitFlag.userData, topics: true });
    return setSubmitFlag({ userData: submitFlag.userData, topics: false });
  }, [setSubmitFlag, topics, userTopics, submitFlag]);

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
        {userTopicsQuery.isPending || allTopicsQuery.query.isPending ? (
          <div className="mt-2">
            <Loader />
          </div>
        ) : (
          <MultiSelect
            setValues={setTopics}
            options={allTopics}
            values={topics}
          />
        )}
      </div>
    </div>
  );
};
export default TopicSelector;
