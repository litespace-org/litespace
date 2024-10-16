import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import React, { useCallback } from "react";
import { ILesson } from "@litespace/types";
import List from "@/components/Lessons/List";
import { Button, messages, Spinner, atlas, ButtonSize } from "@litespace/luna";
import { useIntl } from "react-intl";
import { isEmpty } from "lodash";
import Empty from "@/components/Lessons/Empty";
import Error from "@/components/Lessons/Error";
import { usePaginationQuery } from "@/hooks/common";

const Lessons: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelectors.user);

  const findUserLessons = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<ILesson.FindUserLessonsApiResponse> => {
      if (!profile) return { list: [], total: 0 };
      return atlas.lesson.findUserLessons(profile.id, {
        page: pageParam,
        size: 10,
      });
    },
    [profile]
  );

  const {
    query: lessons,
    list,
    more,
  } = usePaginationQuery(findUserLessons, ["find-lessons"]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-10">
      {profile && list && isEmpty(list) ? (
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

      {lessons && list && profile ? (
        <div>
          <List list={list} user={profile} />
          {!isEmpty(list) ? (
            <div className="mr-6">
              <Button
                size={ButtonSize.Small}
                loading={lessons.isLoading || lessons.isFetching}
                disabled={
                  lessons.isLoading ||
                  lessons.isFetching ||
                  !lessons.hasNextPage
                }
                onClick={more}
              >
                {intl.formatMessage({
                  id: messages["global.labels.more"],
                })}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Lessons;
