import List from "@/components/Media/List";
import { useAtlas } from "@litespace/headless/atlas";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Loading } from "@litespace/luna/Loading";
import { Spinner } from "@litespace/luna/Spinner";
import { usePaginationQuery } from "@litespace/luna/hooks/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import { isEmpty } from "lodash";
import React, { useCallback } from "react";

const Media: React.FC = () => {
  const intl = useFormatMessage();
  const atlas = useAtlas();
  const findTutors = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return await atlas.user.findTutorsForMediaProvider({ page: pageParam });
    },
    [atlas.user]
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
