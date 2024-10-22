import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import React from "react";
import List from "@/components/Lessons/List";
import { Button, Spinner, ButtonSize, useFormatMessage } from "@litespace/luna";
import { isEmpty } from "lodash";
import Empty from "@/components/Lessons/Empty";
import Error from "@/components/Lessons/Error";
import { useFindUserLessons } from "@litespace/headless/lessons";

const Lessons: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.user);

  const { query: lessons, list, more } = useFindUserLessons(profile?.id);

  return (
    <div className="w-full px-8 py-10 mx-auto max-w-screen-2xl">
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
                {intl("global.labels.more")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Lessons;
