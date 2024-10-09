import List from "@/components/Media/List";
import {
  Button,
  ButtonSize,
  Loading,
  Spinner,
  useFormatMessage,
  usePaginationQuery,
  atlas,
} from "@litespace/luna";
import { isEmpty } from "lodash";
import React, { useCallback } from "react";

const Media: React.FC = () => {
  const intl = useFormatMessage();
  const findTutors = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return await atlas.user.findTutorsForMediaProvider({ page: pageParam });
    },
    []
  );
  const media = usePaginationQuery(findTutors, ["find-tutors"]);

  return (
    <div className="max-w-screen-2xl mx-auto w-full p-6">
      <div className="flex flex-row gap-2 items-center">
        <h1 className="text-3xl mb-4">{intl("media.title")}</h1>
        {media.query.isFetching && !media.query.isLoading ? <Spinner /> : null}
      </div>

      <Loading show={media.query.isLoading} className="h-screen" />

      {media.list && !isEmpty(media.list) ? (
        <div>
          <List list={media.list} refersh={media.query.refetch} />
          <Button
            size={ButtonSize.Small}
            disabled={
              media.query.isLoading ||
              media.query.isFetching ||
              !media.query.hasNextPage
            }
            loading={media.query.isFetching}
            onClick={media.more}
          >
            {intl("global.labels.more")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Media;
