import List from "@/components/Media/List";
import { Button, ButtonSize } from "@litespace/luna/components/Button";
import { Loading } from "@litespace/luna/components/Loading";
import Spinner from "@litespace/luna/icons/spinner";
import { useFormatMessage, usePaginationQuery } from "@litespace/luna/hooks";
import { atlas } from "@litespace/luna/lib";

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
    <div className="w-full p-6 mx-auto max-w-screen-2xl">
      <div className="flex flex-row items-center gap-2">
        <h1 className="mb-4 text-3xl">{intl("media.title")}</h1>
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
