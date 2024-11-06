import List from "@/components/Lessons/List";
import Error from "@/components/common/Error";
import PageTitle from "@/components/common/PageTitle";
import { useFindLessons } from "@litespace/headless/lessons";
import { ActionsMenu, MenuAction } from "@litespace/luna/ActionsMenu";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { ILesson } from "@litespace/types";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";

const Lessons = () => {
  const intl = useFormatMessage();
  const [ratified, setRatified] = useState<boolean>(true);
  const [canceled, setCanceled] = useState<boolean>(true);
  const [future, setFuture] = useState<boolean>(true);
  const [past, setPast] = useState<boolean>(true);
  const [now, setNow] = useState<boolean>(false);

  const filter = useMemo(
    (): ILesson.FindLessonsApiQuery => ({
      ratified,
      canceled,
      future,
      past,
      now,
    }),
    [canceled, future, now, past, ratified]
  );

  const { query, ...pagination } = useFindLessons(filter);

  const actions = useMemo(
    (): MenuAction[] => [
      {
        id: 1,
        label: intl("global.labels.cancel"),
        onClick: () => {
          setRatified(true);
          setCanceled(true);
          setFuture(true);
          setPast(true);
        },
        disabled: ratified && canceled && future && past,
        danger: true,
      },
      {
        id: 2,
        label: intl("dashboard.lessons.filter.status"),
        subActions: [
          {
            id: 1,
            label: intl("global.labels.all"),
            onClick: () => {
              setRatified(true);
              setCanceled(true);
            },
            checked: ratified && canceled,
            disabled: ratified && canceled,
          },
          {
            id: 2,
            label: intl("dashboard.lessons.filter.status.ratified"),
            onClick: () => setRatified(!ratified),
            checked: ratified,
          },
          {
            id: 3,
            label: intl("dashboard.lessons.filter.status.canceled"),
            onClick: () => setCanceled(!canceled),
            checked: canceled,
          },
        ],
      },
      {
        id: 4,
        label: intl("dashboard.lessons.filter.date"),
        onClick: () => setFuture(!future),
        subActions: [
          {
            id: 1,
            label: intl("global.labels.all"),
            onClick: () => {
              setFuture(true);
              setPast(true);
              setNow(false);
            },
            checked: future && past,
            disabled: future && past,
          },
          {
            id: 2,
            label: intl("dashboard.lessons.filter.date.future"),
            onClick: () => setFuture(!future),
            checked: future,
          },
          {
            id: 3,
            label: intl("dashboard.lessons.filter.date.past"),
            onClick: () => setPast(!past),
            checked: past,
          },
          {
            id: 4,
            label: intl("dashboard.lessons.filter.date.now"),
            onClick: () => {
              setNow(!now);
              setPast(false);
              setFuture(false);
            },
            checked: now || (past && future),
            disabled: past && future,
          },
        ],
      },
    ],
    [canceled, future, intl, now, past, ratified]
  );

  if (query.error)
    return (
      <Error
        error={query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.refetch}
      />
    );

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <header className="flex flex-row gap-2 mb-3">
        <PageTitle
          fetching={query.isFetching && !query.isLoading}
          title={intl("dashboard.lessons.title")}
          count={query.data?.total}
        />

        <ActionsMenu actions={actions} Icon={MixerHorizontalIcon} />
      </header>

      <List query={query} {...pagination} />
    </div>
  );
};
export default Lessons;
