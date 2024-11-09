import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Interviews/List";
import { useFindInterviews } from "@litespace/headless/interviews";
import { ActionsMenu, MenuAction } from "@litespace/luna/ActionsMenu";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { orUndefined } from "@litespace/sol/utils";
import { IFilter, IInterview } from "@litespace/types";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import React, { useMemo, useState } from "react";

const Content: React.FC<{ user?: number }> = ({ user }) => {
  const intl = useFormatMessage();
  const [status, setStatus] = useState<IInterview.Status[] | null>(null);
  const [level, setLevel] = useState<number[] | null>(null);
  const [signed, setSigned] = useState<boolean | null>(null);
  const [orderDirection, setOrderDirection] = useState<IFilter.OrderDirection>(
    IFilter.OrderDirection.Descending
  );
  const filter = useMemo(
    (): IInterview.FindInterviewsApiQuery => ({
      users: user ? [user] : undefined,
      statuses: orUndefined(status),
      levels: orUndefined(level),
      signed: typeof signed === "boolean" ? signed : undefined,
    }),
    [status, level, signed, orderDirection]
  );
  const interviews = useFindInterviews(filter);
  const actions = useMemo(
    (): MenuAction[] => [
      {
        id: 0,
        label: intl("global.labels.cancel"),
        danger: true,
        disabled:
          (status === null || status.length === 0) &&
          (level === null || level.length === 0) &&
          signed === null,
        onClick: () => {
          setStatus(null);
          setLevel(null);
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
            onClick: () => setStatus(null),
            danger: true,
            disabled: status === null || status.length === 0,
          },
          {
            id: 1,
            label: intl("dashboard.interview.status.pending"),
            onClick: () =>
              setStatus((prev) => {
                if (prev === null) return [IInterview.Status.Pending];
                if (prev.includes(IInterview.Status.Pending))
                  return prev.filter((el) => el !== IInterview.Status.Pending);
                return [...prev, IInterview.Status.Pending];
              }),
            checked: status?.includes(IInterview.Status.Pending),
          },
          {
            id: 2,
            label: intl("dashboard.interview.status.passed"),
            onClick: () =>
              setStatus((prev) => {
                if (prev === null) return [IInterview.Status.Passed];
                if (prev.includes(IInterview.Status.Passed))
                  return prev.filter((el) => el !== IInterview.Status.Passed);
                return [...prev, IInterview.Status.Passed];
              }),
            checked: status?.includes(IInterview.Status.Passed),
          },
          {
            id: 3,
            label: intl("dashboard.interview.status.rejected"),
            onClick: () =>
              setStatus((prev) => {
                if (prev === null) return [IInterview.Status.Rejected];
                if (prev.includes(IInterview.Status.Rejected))
                  return prev.filter((el) => el !== IInterview.Status.Rejected);
                return [...prev, IInterview.Status.Rejected];
              }),
            checked: status?.includes(IInterview.Status.Rejected),
          },
          {
            id: 4,
            label: intl("dashboard.interview.status.canceled"),
            onClick: () =>
              setStatus((prev) => {
                if (prev === null) return [IInterview.Status.Canceled];
                if (prev.includes(IInterview.Status.Canceled))
                  return prev.filter((el) => el !== IInterview.Status.Canceled);
                return [...prev, IInterview.Status.Canceled];
              }),
            checked: status?.includes(IInterview.Status.Canceled),
          },
        ],
      },
      {
        id: 2,
        label: intl("dashboard.interview.level"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            onClick: () => setLevel(null),
            danger: true,
            disabled: level === null || level.length === 0,
          },
          {
            id: 1,
            label: "1",
            onClick: () =>
              setLevel((prev) => {
                if (prev === null) return [1];
                if (prev.includes(1)) return prev.filter((el) => el !== 1);
                return [...prev, 1];
              }),
            checked: level?.includes(1),
          },
          {
            id: 2,
            label: "2",
            onClick: () =>
              setLevel((prev) => {
                if (prev === null) return [2];
                if (prev.includes(2)) return prev.filter((el) => el !== 2);
                return [...prev, 2];
              }),
            checked: level?.includes(2),
          },
          {
            id: 3,
            label: "3",
            onClick: () =>
              setLevel((prev) => {
                if (prev === null) return [3];
                if (prev.includes(3)) return prev.filter((el) => el !== 3);
                return [...prev, 3];
              }),
            checked: level?.includes(3),
          },
          {
            id: 4,
            label: "4",
            onClick: () =>
              setLevel((prev) => {
                if (prev === null) return [4];
                if (prev.includes(4)) return prev.filter((el) => el !== 4);
                return [...prev, 4];
              }),
            checked: level?.includes(4),
          },
          {
            id: 5,
            label: "5",
            onClick: () =>
              setLevel((prev) => {
                if (prev === null) return [5];
                if (prev.includes(5)) return prev.filter((el) => el !== 5);
                return [...prev, 5];
              }),
            checked: level?.includes(5),
          },
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
        label: intl("dashboard.user.filter.order-direction"),
        value: orderDirection,
        onRadioValueChange: (value) =>
          setOrderDirection(value as IFilter.OrderDirection),
        radioGroup: [
          {
            id: 1,
            label: intl("dashboard.user.filter.order-direction.desc"),
            value: IFilter.OrderDirection.Descending,
          },
          {
            id: 2,
            label: intl("dashboard.user.filter.order-direction.asc"),
            value: IFilter.OrderDirection.Ascending,
          },
        ],
      },
    ],
    [status, level, signed, orderDirection, intl]
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
