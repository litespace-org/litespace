import List from "@/components/Interviews/List";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Spinner } from "@litespace/luna/Spinner";
import { messages } from "@litespace/luna/locales";
import { isEmpty } from "lodash";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import Empty from "@/components/Interviews/Empty";
import { useFindInfinitInterviews } from "@litespace/headless/interviews";
import { useUserContext } from "@litespace/headless/context/user";

const Interviews: React.FC = () => {
  const { user } = useUserContext();
  const intl = useIntl();
  const { query: interviews, list, more } = useFindInfinitInterviews(user?.id);

  const onUpdate = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  return (
    <div className="w-full px-8 py-10 mx-auto max-w-screen-2xl">
      {interviews.isLoading ? (
        <div className="flex items-center justify-center mt-32">
          <Spinner />
        </div>
      ) : null}

      {Array.isArray(list) && isEmpty(list) ? (
        <div className="flex items-center justify-center mt-10">
          <Empty />
        </div>
      ) : null}

      {list && user ? (
        <div>
          <List list={list} user={user} onUpdate={onUpdate} />
          <div className="mr-6">
            <Button
              size={ButtonSize.Small}
              loading={interviews.isLoading || interviews.isFetching}
              disabled={
                interviews.isLoading ||
                interviews.isFetching ||
                !interviews.hasNextPage
              }
              onClick={more}
            >
              {intl.formatMessage({
                id: messages["global.labels.more"],
              })}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Interviews;
