import Title from "@/components/Common/Title";
import { CreateTutor, Content } from "@/components/Tutors";
import { useFindFullTutors } from "@litespace/headless/tutor";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import AddCircle from "@litespace/assets/AddCircle";
import { useRender } from "@litespace/headless/common";
import { Typography } from "@litespace/ui/Typography";
import { router } from "@/lib/route";
import { Landing } from "@litespace/utils/routes";
import { IShortUrl } from "@litespace/types";

const Tutors: React.FC = () => {
  const intl = useFormatMessage();
  const { query, next, prev, goto, page, totalPages } = useFindFullTutors();
  const render = useRender();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-3xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <Title
          title={intl("dashboard.tutors.title")}
          count={query.data?.total}
          fetching={query.isFetching}
          url={router.landing({
            route: Landing.ShortUrl,
            name: IShortUrl.Id.ManageTutorsDoc,
            full: true,
          })}
        />

        <CreateTutor
          open={render.open}
          close={render.hide}
          refetch={query.refetch}
        />

        <Button
          onClick={() => render.show()}
          size="large"
          endIcon={
            <AddCircle className="w-4 h-4 [&>*]:stroke-natural-50 icon" />
          }
        >
          <Typography
            tag="span"
            className="text-body font-medium text-natural-50"
          >
            {intl("dashboard.tutors.add-tutor")}
          </Typography>
        </Button>
      </div>

      <Content
        refetch={query.refetch}
        tutors={query.data?.list}
        fetching={query.isFetching}
        loading={query.isLoading}
        error={query.isError}
        next={next}
        prev={prev}
        goto={goto}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
};

export default Tutors;
