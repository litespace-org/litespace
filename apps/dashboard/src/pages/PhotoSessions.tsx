import { useMemo, useState } from "react";

import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Input } from "@litespace/ui/Input";
import { Typography } from "@litespace/ui/Typography";

import { useUserContext } from "@litespace/headless/context/user";
import { useFindStudioTutors } from "@litespace/headless/tutor";

import Search from "@litespace/assets/Search";
import { IUser } from "@litespace/types";

import { TutorCardProps } from "@/types/tutor";
import CardsWrapper from "@/components/Tutor/CardsWrapper";

const PhotoSessions = () => {
  const intl = useFormatMessage();
  const { user } = useUserContext();

  const [search, setSearch] = useState("");
  const [searchInputTimeout, setSearchInputTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const tutorsQuery = useFindStudioTutors(
    user?.role === IUser.Role.Studio ? user.id : undefined,
    search
  );

  const cards: TutorCardProps[] = useMemo(() => {
    return (
      tutorsQuery.list?.map((item) => ({
        name: item.name || "",
        email: item.email || "",
        image: item.image || "",
        registrationDate: new Date(item.createdAt),
      })) || []
    );
  }, [tutorsQuery.list]);

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
          onChange={(e) => {
            if (searchInputTimeout) clearTimeout(searchInputTimeout);
            setSearchInputTimeout(
              setTimeout(() => setSearch(e.target.value), 750)
            );
          }}
        />
      </div>

      <CardsWrapper
        cards={cards}
        more={tutorsQuery.more}
        loading={tutorsQuery.query.isPending}
        error={tutorsQuery.query.isError}
        thereAreMore={tutorsQuery.thereAreMore}
      />
    </div>
  );
};

export default PhotoSessions;
