import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import { ILesson } from "@litespace/types";
import List from "@/components/Lessons/List";
import { Button, messages, Spinner } from "@litespace/luna";
import { useIntl } from "react-intl";
import { cloneDeep, concat, isEmpty, uniqBy } from "lodash";
import Empty from "@/components/Lessons/Empty";
import Error from "@/components/Lessons/Error";

const Lessons: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<ILesson.FindUserLessonsApiResponse | null>(
    null
  );

  // onSuccess is removed from query
  const onSuccess = useCallback(
    (response: ILesson.FindUserLessonsApiResponse) => {
      if (!data) return setData(response);
      setData({
        list: uniqBy(
          concat(cloneDeep(data.list), response.list),
          (item) => item.lesson.id
        ),
        total: response.total,
      });
    },
    [data]
  );

  const more = useCallback(() => {
    setPage(page + 1);
  }, [page]);

  const queryKey = useMemo(() => ["get-user-lessons", page.toString()], [page]);

  const findUserLessons = useCallback(() => {
    if (!profile) return { list: [], total: 0 };
    return atlas.lesson.findUserLessons(profile.id, { page, size: 10 });
  }, [page, profile]);

  const lessons = useQuery({
    queryFn: findUserLessons,
    // onSuccess,
    queryKey,
    enabled: !!profile,
  });

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-10">
      {profile && data && isEmpty(data.list) ? (
        <div className="mb-4">
          <Empty role={profile.role} />
        </div>
      ) : null}

      {lessons.isLoading ? (
        <div className="flex items-center justify-center h-1/2">
          <Spinner />
        </div>
      ) : null}

      {lessons.error ? <Error error={lessons.error} /> : null}

      {data && profile ? (
        <div>
          <List list={data.list} user={profile} />
          <div className="mr-6">
            <Button
              loading={lessons.isLoading || lessons.isFetching}
              disabled={
                lessons.isLoading ||
                lessons.isFetching ||
                data.list.length === data.total
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

export default Lessons;
