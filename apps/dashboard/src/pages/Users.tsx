import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/Users/List";
import UserForm from "@/components/Users/UserForm";
import { useUsers } from "@litespace/headless/users";
import { ActionsMenu, MenuAction } from "@litespace/ui/ActionsMenu";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { IUser } from "@litespace/types";
import { rolesMap } from "@/components/utils/user";
import { optional } from "@litespace/utils/utils";

export const Users: React.FC = () => {
  const intl = useFormatMessage();
  const [role, setRole] = useState<IUser.Role | null>(null);
  const [gender, setGender] = useState<IUser.Gender | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  const filter = useMemo(
    (): IUser.FindUsersApiQuery => ({
      role: optional(role),
      gender: optional(gender),
      verified: typeof verified === "boolean" ? verified : undefined,
    }),
    [gender, role, verified]
  );

  const users = useUsers(filter);

  const makeRoleOption = useCallback(
    (id: number, roleOption: IUser.Role): MenuAction => {
      return {
        id,
        label: intl(rolesMap[roleOption]),
        value: roleOption.toString(),
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
          online === null,
        onClick: () => {
          setRole(null);
          setGender(null);
          setVerified(null);
          setOnline(null);
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
          makeRoleOption(3, IUser.Role.Studio),
          makeRoleOption(4, IUser.Role.TutorManager),
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
    ],
    [gender, intl, makeRoleOption, online, role, verified]
  );

  return (
    <div className={cn("w-full flex flex-col p-6 max-w-screen-3xl mx-auto")}>
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <PageTitle
            title={intl("dashboard.users.title")}
            fetching={users.query.isFetching && !users.query.isLoading}
            count={users.query.data?.total}
          />

          <ActionsMenu actions={actions} Icon={MixerHorizontalIcon} />
        </div>

        <UserForm refresh={users.query.refetch} />
      </header>

      <List {...users} />
    </div>
  );
};

export default Users;
