import { useMemo, useState } from "react";

import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Input } from "@litespace/ui/Input";
import { Typography } from "@litespace/ui/Typography";

import { useUser } from "@litespace/headless/context/user";
import { useFindStudioTutors } from "@litespace/headless/tutor";

import Search from "@litespace/assets/Search";
import { IUser } from "@litespace/types";

import Tutors from "@/components/PhotoSessions/TutorsList";
import { debounce } from "lodash";

const PhotoSessions = () => {
  const intl = useFormatMessage();
  const { user } = useUser();

  const [search, setSearch] = useState("");

  const tutorsQuery = useFindStudioTutors(
    user?.role === IUser.Role.Studio ? user.id : undefined,
    search
  );

  const refetch = useMemo(
    () =>
      debounce(() => {
        tutorsQuery.query.refetch();
      }, 500),
    [tutorsQuery.query]
  );

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6 gap-6">
      <Typography
        tag="h1"
        className="py-6 text-subtitle-2 font-bold border-natural-300 border-b"
      >
        {intl("dashboard.photo-sessions.title")}
      </Typography>

      <div className="md:w-[276px]">
        <Input
          placeholder={intl("dashboard.photo-sessions.search-placeholder")}
          icon={<Search width={16} height={16} />}
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value);
            refetch();
          }}
        />
      </div>

      <Tutors
        list={tutorsQuery.list || []}
        more={tutorsQuery.more}
        loading={tutorsQuery.query.isPending}
        error={tutorsQuery.query.isError}
        hasMore={tutorsQuery.hasMore}
      />
    </div>
  );
};

export default PhotoSessions;
