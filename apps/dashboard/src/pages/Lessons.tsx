import List from "@/components/Lessons/List";
import Error from "@/components/common/Error";
import PageTitle from "@/components/common/PageTitle";
import { useFindLessons } from "@litespace/headless/lessons";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

const Lessons = () => {
  const intl = useFormatMessage();
  const { query, ...pagination } = useFindLessons({});

  if (query.error) {
    return (
      <Error
        error={query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.refetch}
      />
    );
  }
  return (
    <div className="p-8">
      <PageTitle
        fetching={query.isFetching}
        title={intl("dashboard.navbar.lessons")}
        count={query.data?.total}
      />
      <div className="p-6">
        {query.isLoading ? (
          <Loading className="h-screen" show={query.isLoading} />
        ) : query.data ? (
          <List query={query} {...pagination} />
        ) : null}
      </div>
    </div>
  );
};
export default Lessons;
