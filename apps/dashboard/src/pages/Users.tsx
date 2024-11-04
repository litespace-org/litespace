import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Users/List";
import UserForm from "@/components/Users/UserForm";
import { useUsers } from "@litespace/headless/users";
import { ActionsMenu, MenuAction } from "@litespace/luna/ActionsMenu";
import { useRender } from "@litespace/luna/hooks/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { IFilter, IUser } from "@litespace/types";
import { rolesMap } from "@/components/utils/user";
import { orUndefined } from "@litespace/sol/utils";

export const Users: React.FC = () => {
  const form = useRender();
  const intl = useFormatMessage();
  const [role, setRole] = useState<IUser.Role | null>(null);
  const [gender, setGender] = useState<IUser.Gender | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [orderBy, setOrderBy] = useState<
    IUser.FindUsersApiQuery["orderBy"] | null
  >(null);
  const [orderDirection, setOrderDirection] = useState<IFilter.OrderDirection>(
    IFilter.OrderDirection.Descending
  );

  const filter = useMemo(
    (): IUser.FindUsersApiQuery => ({
      role: orUndefined(role),
      gender: orUndefined(gender),
      verified: typeof verified === "boolean" ? verified : undefined,
      online: typeof online === "boolean" ? online : undefined,
      orderBy: orUndefined(orderBy),
      orderDirection,
    }),
    [gender, online, orderBy, orderDirection, role, verified]
  );

  const users = useUsers(filter);

  const makeRoleOption = useCallback(
    (id: number, roleOption: IUser.Role): MenuAction => {
      return {
        id,
        label: intl(rolesMap[roleOption]),
        value: roleOption,
        checked: role === roleOption,
        onClick: () => setRole(roleOption),
      };
    },
    [intl, role]
  );

  const actions = useMemo(
    (): MenuAction[] => [
      {
        id: 0,
        label: intl("global.labels.cancel"),
        danger: true,
        disabled:
          role === null &&
          gender === null &&
          verified === null &&
          online === null &&
          orderBy === null,
        onClick: () => {
          setRole(null);
          setGender(null);
          setVerified(null);
          setOnline(null);
          setOrderBy(null);
          setOrderDirection(IFilter.OrderDirection.Descending);
        },
      },
      {
        id: 1,
        label: intl("dashboard.user.role"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            onClick: () => setRole(null),
            danger: true,
            disabled: role === null,
          },
          makeRoleOption(1, IUser.Role.SuperAdmin),
          makeRoleOption(2, IUser.Role.RegularAdmin),
          makeRoleOption(3, IUser.Role.MediaProvider),
          makeRoleOption(4, IUser.Role.Interviewer),
          makeRoleOption(5, IUser.Role.Tutor),
          makeRoleOption(6, IUser.Role.Student),
        ],
      },
      {
        id: 2,
        label: intl("dashboard.user.gender"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            onClick: () => setGender(null),
            danger: true,
            disabled: gender === null,
          },
          {
            id: 1,
            label: intl("global.gender.male"),
            onClick: () => setGender(IUser.Gender.Male),
            checked: gender === IUser.Gender.Male,
          },
          {
            id: 2,
            label: intl("global.gender.female"),
            onClick: () => setGender(IUser.Gender.Female),
            checked: gender === IUser.Gender.Female,
          },
        ],
      },
      {
        id: 3,
        label: intl("dashboard.user.filter.verified-state"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            disabled: verified === null,
            danger: true,
            onClick: () => setVerified(null),
          },
          {
            id: 1,
            label: intl("dashboard.user.filter.verified-state.verified"),
            checked: verified === true,
            onClick: () => setVerified(true),
          },
          {
            id: 2,
            label: intl("dashboard.user.filter.verified-state.unverified"),
            checked: verified === false,
            onClick: () => setVerified(false),
          },
        ],
      },
      {
        id: 4,
        label: intl("dashboard.user.filter.online-state"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            disabled: online === null,
            danger: true,
            onClick: () => setVerified(null),
          },
          {
            id: 1,
            label: intl("dashboard.user.filter.online-state.online"),
            checked: online === true,
            onClick: () => setOnline(true),
          },
          {
            id: 2,
            label: intl("dashboard.user.filter.online-state.offline"),
            checked: online === false,
            onClick: () => setOnline(false),
          },
        ],
      },
      {
        id: 5,
        label: intl("dashboard.user.filter.order-by"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            disabled: orderBy === null,
            danger: true,
            onClick: () => setOrderBy(null),
          },
          {
            id: 1,
            label: intl("dashboard.user.filter.order-by.create-at"),
            checked: orderBy === "created_at",
            onClick: () => setOrderBy("created_at"),
          },
          {
            id: 2,
            label: intl("dashboard.user.filter.order-by.updated-at"),
            checked: orderBy === "updated_at",
            onClick: () => setOrderBy("updated_at"),
          },
        ],
      },
      {
        id: 6,
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
    [
      gender,
      intl,
      makeRoleOption,
      online,
      orderBy,
      orderDirection,
      role,
      verified,
    ]
  );

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <PageTitle
            title={intl("dashboard.users.title")}
            fetching={users.query.isFetching && !users.query.isLoading}
            count={users.query.data?.total}
          />

          <ActionsMenu actions={actions} Icon={MixerHorizontalIcon} />
        </div>

        <UserForm
          open={form.open}
          setOpen={form.setOpen}
          close={form.hide}
          refresh={users.query.refetch}
        />
      </header>

      <List {...users} />
    </div>
  );
};

export default Users;
