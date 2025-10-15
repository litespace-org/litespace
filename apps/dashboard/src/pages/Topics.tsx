import Title from "@/components/Common/Title";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { usePaginatedTopics } from "@litespace/headless/topic";
import List from "@/components/Topics/List";
import { Button } from "@litespace/ui/Button";
import { useRender } from "@litespace/headless/common";
import TopicDialog from "@/components/Topics/TopicDialog";
import { ChangeEvent, useCallback, useState } from "react";
import { Input } from "@litespace/ui/Input";

const Topics = () => {
  const intl = useFormatMessage();
  const addNewTopic = useRender();

  const [name, setName] = useState<string>("");

  const query = usePaginatedTopics({ name });

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <div className="flex flex-row justify-between">
        <Title
          title={intl("dashboard.topics.title")}
          fetching={query.query.isFetching && !query.query.isLoading}
          count={query.query.data?.total}
        />
        <Button size={"small"} onClick={addNewTopic.show}>
          {intl("dashboard.topics.add")}
        </Button>
      </div>

      <div className="flex flex-row justify-start gap-4 mt-2">
        <Input
          onChange={handleNameChange}
          placeholder={intl("dashboard.topics.name")}
          value={name}
        />
      </div>

      <div className="mt-4">
        <List {...query} />
      </div>

      <TopicDialog
        close={addNewTopic.hide}
        open={addNewTopic.open}
        onUpdate={query.query.refetch}
      />
    </div>
  );
};

export default Topics;
