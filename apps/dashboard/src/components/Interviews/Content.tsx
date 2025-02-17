import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Interviews/List";
import {
  useFindInterviews,
  type UseFindInterviewsPayload,
} from "@litespace/headless/interviews";
import { ActionsMenu, MenuAction } from "@litespace/ui/ActionsMenu";
import { useDashFormatMessage } from "@/hooks/intl";
import { IFilter, IInterview } from "@litespace/types";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { interviewStatusMap } from "@/components/utils/interview";
import { isEmpty } from "lodash";
import React, { useCallback, useMemo, useState } from "react";

const DEFAULT_STATUS_FILTER = [
  IInterview.Status.Pending,
  IInterview.Status.Passed,
  IInterview.Status.Rejected,
  IInterview.Status.Canceled,
];

const Content: React.FC<{ user?: number }> = ({ user }) => {
  const intl = useDashFormatMessage();
  const [statuses, setStatus] = useState<IInterview.Status[]>(
    DEFAULT_STATUS_FILTER
  );
  const [levels, setLevels] = useState<number[]>([]);
  const [signed, setSigned] = useState<boolean | null>(null);
  const [orderDirection, setOrderDirection] = useState<IFilter.OrderDirection>(
    IFilter.OrderDirection.Descending
  );

  const filter = useMemo(
    (): UseFindInterviewsPayload => ({
      users: user ? [user] : undefined,
      userOnly: !!user,
      statuses: statuses,
      levels: !isEmpty(levels) ? levels : undefined,
      signed: typeof signed === "boolean" ? signed : undefined,
    }),
    [user, statuses, levels, signed]
  );

  const makeLevelOption = useCallback(
    (level: number): MenuAction => ({
      id: level,
      label: level.toString(),
      onClick: () =>
        setLevels((prev) => {
          if (prev.includes(level)) return prev.filter((el) => el !== level);
          return [...prev, level];
        }),
      checked: levels.includes(level),
    }),
    [levels]
  );

  const makeStatusOption = useCallback(
    (status: IInterview.Status) => ({
      id: status,
      label: intl(interviewStatusMap[status]),
      onClick: () =>
        setStatus((prev) => {
          if (prev.includes(status)) return prev.filter((el) => el !== status);
          return [...prev, status];
        }),
      checked: statuses.includes(status),
    }),
    [intl, statuses]
  );

  const interviews = useFindInterviews(filter);
  const actions = useMemo(
    (): MenuAction[] => [
      {
        id: 0,
        label: intl("global.labels.cancel"),
        danger: true,
        disabled:
          isEmpty(statuses) && isEmpty(levels.length) && signed === null,
        onClick: () => {
          setStatus(DEFAULT_STATUS_FILTER);
          setLevels([]);
          setSigned(null);
          setOrderDirection(IFilter.OrderDirection.Descending);
        },
      },
      {
        id: 1,
        label: intl("dashboard.interview.status"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            onClick: () => setStatus(DEFAULT_STATUS_FILTER),
            danger: true,
            disabled: statuses.length === DEFAULT_STATUS_FILTER.length,
          },
          makeStatusOption(IInterview.Status.Pending),
          makeStatusOption(IInterview.Status.Passed),
          makeStatusOption(IInterview.Status.Canceled),
          makeStatusOption(IInterview.Status.Rejected),
        ],
      },
      {
        id: 2,
        label: intl("dashboard.interview.level"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            onClick: () => setLevels([]),
            danger: true,
            disabled: isEmpty(levels.length),
          },
          makeLevelOption(1),
          makeLevelOption(2),
          makeLevelOption(3),
          makeLevelOption(4),
          makeLevelOption(5),
        ],
      },
      {
        id: 3,
        label: intl("dashboard.interview.actions.sign"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            onClick: () => setSigned(null),
            danger: true,
            disabled: signed === null,
          },
          {
            id: 1,
            label: intl("global.labels.yes"),
            onClick: () => setSigned(true),
            checked: signed === true,
          },
          {
            id: 2,
            label: intl("global.labels.no"),
            onClick: () => setSigned(false),
            checked: signed === false,
          },
        ],
      },
      {
        id: 4,
        label: intl("dashboard.filter.order-direction"),
        value: orderDirection,
        onRadioValueChange: (value) =>
          setOrderDirection(value as IFilter.OrderDirection),
        radioGroup: [
          {
            id: 1,
            label: intl("dashboard.filter.order-direction.desc"),
            value: IFilter.OrderDirection.Descending,
          },
          {
            id: 2,
            label: intl("dashboard.filter.order-direction.asc"),
            value: IFilter.OrderDirection.Ascending,
          },
        ],
      },
    ],
    [
      intl,
      statuses,
      levels,
      signed,
      makeStatusOption,
      makeLevelOption,
      orderDirection,
    ]
  );

  return (
    <div>
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <PageTitle
            title={intl("dashboard.interviews.title")}
            count={interviews.query.data?.total}
            fetching={
              interviews.query.isFetching && !interviews.query.isLoading
            }
          />
          <ActionsMenu actions={actions} Icon={MixerHorizontalIcon} />
        </div>
      </header>

      <List
        {...interviews}
        query={interviews}
        refresh={interviews.query.refetch}
      />
    </div>
  );
};

export default Content;
