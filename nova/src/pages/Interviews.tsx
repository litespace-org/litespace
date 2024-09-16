import List from "@/components/Interviews/List";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { Button, messages, Spinner } from "@litespace/luna";
import { IInterview } from "@litespace/types";
import { cloneDeep, concat, isEmpty, uniqBy } from "lodash";
import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
} from "@tanstack/react-query";

const Interviews: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const intl = useIntl();
  const [list, setList] = useState<
    IInterview.FindInterviewsApiResponse["list"]
  >([]);
  const [page, setPage] = useState<number>(1);

  const findInterviews = useCallback(
    async ({ pageParam = 1 }: QueryFunctionContext) => {
      // if (!profile) return null;
      // return atlas.interview.findInterviews(profile.id, {
      //   page: pageParam,
      //   size: 10,
      // });
    },
    [profile]
  );

  // const onSuccess = useCallback(
  //   ({ list: incoming }: IInterview.FindInterviewsApiResponse) => {
  //     console.log({ page, list, incoming });
  //     setList(
  //       uniqBy(
  //         concat(cloneDeep(list), incoming),
  //         (item) => item.interview.ids.self
  //       )
  //     );
  //   },
  //   [list, page]
  // );

  const interviews = useInfiniteQuery({
    // queryFn: findInterviews,
    // queryKey: "find-interviews",
    // enabled: !!profile,
    // onSuccess,
  });

  const onUpdate = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  const more = useCallback(() => {
    setPage(page + 1);
  }, [page]);

  return (
    <div className="max-w-screen-2xl mx-auto w-full px-6 py-10">
      {interviews.isLoading ? (
        <div className="flex items-center justify-center mt-32">
          <Spinner />
        </div>
      ) : null}

      {!isEmpty(list) && interviews.data && profile ? (
        <div>
          <List list={list} user={profile} onUpdate={onUpdate} />
          <div className="mr-6">
            <Button
              loading={interviews.isLoading || interviews.isFetching}
              disabled={
                interviews.isLoading ||
                interviews.isFetching ||
                list.length === interviews.data.total
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
