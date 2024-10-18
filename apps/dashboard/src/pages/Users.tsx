import List from "@/components/Users/List";
import { useUsers } from "@litespace/headless/users";
import { Spinner, useFormatMessage } from "@litespace/luna";
import React from "react";
import cn from "classnames";

export const Users: React.FC = () => {
  const intl = useFormatMessage();
  const users = useUsers();

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex justify-between items-center mb-3">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl">{intl("dashboard.users.title")}</h1>
          {users.query.isFetching && !users.query.isLoading ? (
            <Spinner />
          ) : null}
        </div>
      </header>
      <List {...users} />
    </div>
  );
};

export default Users;
