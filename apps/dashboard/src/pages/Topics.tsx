import PageTitle from "@/components/common/PageTitle";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useTopics } from "@litespace/headless/topic";
import List from "@/components/Topics/List";

const Topics = () => {
  const intl = useFormatMessage();
  const query = useTopics({});

  return (
    <div className="p-8">
      <PageTitle
        title={intl("dashboard.topics.title")}
        fetching={query.isFetching}
        count={query.data?.list.length}
      />
      <List query={query} />
    </div>
  );
};

export default Topics;
