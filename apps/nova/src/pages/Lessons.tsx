import React from "react";
import List from "@/components/Lessons/List";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { isEmpty } from "lodash";
import Empty from "@/components/Lessons/Empty";
import Error from "@/components/Lessons/Error";
import { useFindLessons } from "@litespace/headless/lessons";
import { Loading } from "@litespace/luna/Loading";
import { useUser } from "@litespace/headless/user-ctx";
import { useBackend } from "@litespace/headless/backend";

const Lessons: React.FC = () => {
  const intl = useFormatMessage();
  const { user } = useUser();

  const b = useBackend();

  console.log(b);

  const { query, ...pagination } = useFindLessons({
    users: user ? [user.id] : undefined,
    userOnly: true,
  });

  return (
    <div className="w-full px-8 py-10 mx-auto max-w-screen-2xl">
      {query.isLoading ? <Loading /> : null}
      {user && query.data && isEmpty(query.data.list) ? (
        <div className="mb-4">
          <Empty role={user.role} />
        </div>
      ) : null}

      {query.error ? <Error error={query.error} /> : null}

      {query.data?.list && user ? (
        <div>
          <List list={query.data?.list} user={user} />
          {!isEmpty(query.data.list) ? (
            <div className="mr-6 flex items-center gap-4">
              <Button
                size={ButtonSize.Small}
                loading={query.isFetching}
                disabled={query.isFetching || pagination.page === 1}
                onClick={pagination.prev}
              >
                {intl("global.labels.previous")}
              </Button>
              <Button
                size={ButtonSize.Small}
                loading={query.isFetching}
                disabled={
                  query.isFetching || pagination.page === pagination.totalPages
                }
                onClick={pagination.next}
              >
                {intl("global.labels.next")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Lessons;
