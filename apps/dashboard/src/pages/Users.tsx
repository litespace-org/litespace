import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Users/List";
import { useUsers } from "@litespace/headless/users";
import { useFormatMessage } from "@litespace/luna";
import cn from "classnames";
import React from "react";

export const Users: React.FC = () => {
  const intl = useFormatMessage();
  const users = useUsers();
  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex justify-between items-center mb-3">
        <PageTitle
          title={intl("dashboard.users.title")}
          fetching={users.query.isFetching && !users.query.isLoading}
          count={users.query.data?.total}
        />
      </header>
      <List {...users} />
    </div>
  );
};

export default Users;
