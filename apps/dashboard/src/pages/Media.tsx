import List from "@/components/Media/List";
import { useAtlas } from "@litespace/headless/atlas";
import { Button } from "@litespace/ui/Button";
import { Loading } from "@litespace/ui/Loading";
import { Spinner } from "@litespace/ui/Spinner";
import { usePaginationQuery } from "@litespace/ui/hooks/common";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import { isEmpty } from "lodash";
import React, { useCallback } from "react";

const Media: React.FC = () => {
  const intl = useFormatMessage();
  const atlas = useAtlas();
  const findTutors = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return await atlas.user.findTutorsForStudio({ page: pageParam });
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
            size={"medium"}
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
