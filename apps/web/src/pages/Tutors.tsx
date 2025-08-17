import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/Tutors/Content";
import { useOnError } from "@/hooks/error";
import { useTutors } from "@litespace/headless/tutor";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useState, useMemo } from "react";
import TutorFilters from "@/components/Tutors/TutorFilters";

const Tutors: React.FC = () => {
  const intl = useFormatMessage();
  const tutors = useTutors();

  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const filteredTutors = useMemo(() => {
    if (!tutors.list) return null;
    switch (selectedFilter) {
      case "recommended":
        return tutors.list;
      case "available_now":
        return tutors.list.filter((t) => t.notice === 0);
      case "male":
        return tutors.list.filter((t) => t.gender === "male");
      case "female":
        return tutors.list.filter((t) => t.gender === "female");
      case "rating_4_plus":
        return tutors.list.filter((t) => t.avgRating >= 4);
      default:
        return tutors.list;
    }
  }, [tutors.list, selectedFilter]);

  useOnError({
    type: "query",
    error: tutors.query.error,
    keys: tutors.keys,
  });

  return (
    <div className="w-full p-6 mx-auto max-w-screen-3xl">
      <PageTitle
        title={intl("tutors.title")}
        fetching={tutors.query.isFetching && !tutors.query.isLoading}
        className="mb-6"
      />

      <TutorFilters selected={selectedFilter} onSelect={setSelectedFilter} />

      <Content
        tutors={filteredTutors}
        loading={tutors.query.isLoading}
        fetching={tutors.query.isFetching && !tutors.query.isLoading}
        error={tutors.query.isError}
        more={tutors.more}
        hasMore={tutors.query.hasNextPage && !tutors.query.isPending}
        refetch={tutors.query.refetch}
      />
    </div>
  );
};

export default Tutors;
