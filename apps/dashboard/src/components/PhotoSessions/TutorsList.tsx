import React from "react";
import { InView } from "react-intersection-observer";
import TutorCard from "@/components/PhotoSessions/TutorCard";
import { ITutor, Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

const TutorsList: React.FC<{
  list: ITutor.StudioTutorFields[];
  more: Void;
  loading: boolean;
  error: boolean;
  hasMore: boolean;
}> = ({ list, more, loading, error, hasMore }) => {
  const intl = useFormatMessage();
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        {list.map((item) => (
          <div
            className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2"
            key={item.id}
          >
            <TutorCard
              id={item.id}
              studioId={item.studioId}
              name={item.name}
              image={item.image}
              email={item.email}
              createdAt={item.createdAt}
            />
          </div>
        ))}
      </div>

      {hasMore && !loading && !error ? (
        <InView
          className="self-center"
          onChange={(inview) => {
            if (inview) more();
          }}
        />
      ) : null}

      {loading ? <Loading /> : null}

      {error ? (
        <LoadingError
          size="large"
          retry={more}
          error={intl("error.api.unexpected")}
        />
      ) : null}
    </>
  );
};

export default TutorsList;
