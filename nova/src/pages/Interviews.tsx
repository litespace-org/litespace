import List from "@/components/Interviews/List";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { Button, messages, Spinner } from "@litespace/luna";
import { IInterview } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import Empty from "@/components/Interviews/Empty";
import { usePaginationQuery } from "@/hooks/common";

const Interviews: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const intl = useIntl();

  const findInterviews = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<IInterview.FindInterviewsApiResponse> => {
      if (!profile) return { list: [], total: 0 };
      return atlas.interview.findInterviews(profile.id, {
        page: pageParam,
        size: 10,
      });
    },
    [profile]
  );

  const {
    query: interviews,
    list,
    more,
  } = usePaginationQuery(findInterviews, ["find-interviews"]);

  const onUpdate = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  return (
    <div className="max-w-screen-2xl mx-auto w-full px-6 py-10">
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

      {list && profile ? (
        <div>
          <List list={list} user={profile} onUpdate={onUpdate} />
          <div className="mr-6">
            <Button
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
