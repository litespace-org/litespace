import List from "@/components/Interviews/List";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { Button, messages, Spinner } from "@litespace/luna";
import { IInterview } from "@litespace/types";
import { flatten, isEmpty, sum } from "lodash";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useInfiniteQuery } from "@tanstack/react-query";
import Empty from "@/components/Interviews/Empty";

const Interviews: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const intl = useIntl();

  const findInterviews = useCallback(
    async ({
      pageParam = 1,
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

  const getNextPageParam = useCallback(
    (
      last: IInterview.FindInterviewsApiResponse,
      all: IInterview.FindInterviewsApiResponse[],
      lastPageParam: number
    ) => {
      const page = lastPageParam;
      const total = sum(all.map((page) => page.list.length));
      if (total >= last.total) return null;
      return page + 1;
    },
    []
  );

  const interviews = useInfiniteQuery({
    queryFn: findInterviews,
    queryKey: ["find-interviews"],
    initialPageParam: 1,
    getNextPageParam,
  });

  const list = useMemo(() => {
    if (!interviews.data) return null;
    return flatten(interviews.data.pages.map((page) => page.list));
  }, [interviews.data]);

  const onUpdate = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  const more = useCallback(() => {
    interviews.fetchNextPage();
  }, [interviews]);

  return (
    <div className="max-w-screen-2xl mx-auto w-full px-6 py-10">
      {interviews.isLoading ? (
        <div className="flex items-center justify-center mt-32">
          <Spinner />
        </div>
      ) : null}

      {isEmpty(list) ? (
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
