import { Alert } from "@litespace/luna/Alert";
import { Spinner } from "@litespace/luna/Spinner";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { ITutor, Void } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useCallback, useMemo } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TutorCard from "@/components/Tutors/TutorCard";
import PaginationButtons from "@/components/Common/PaginationButtons";

const TutorList: React.FC<{
  tutors: UseQueryResult<ITutor.FindOnboardedTutorsApiResponse, unknown>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  totalPages: number;
  page: number;
}> = ({ tutors, next, prev, totalPages, page, goto }) => {
  const intl = useFormatMessage();
  const navigate = useNavigate();

  const reload = useMemo(() => {
    return {
      label: intl("global.labels.reload.page"),
      onClick() {
        navigate(0);
      },
    };
  }, [intl, navigate]);

  const gotoFirstPage = useCallback(() => {
    goto(1);
  }, [goto]);

  const gotoLastPage = useCallback(() => {
    goto(totalPages);
  }, [totalPages, goto]);

  if (tutors.isLoading)
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Spinner />
      </div>
    );

  if (tutors.isError)
    return (
      <Alert title={intl("error.tutors.list.error")} action={reload}>
        {tutors.error instanceof Error ? tutors.error.message : null}
      </Alert>
    );

  // todo: show empty search list with a nice image
  if (!tutors.data || isEmpty(tutors.data.list))
    return <Alert title={intl("error.tutors.list.empty")} />;

  return (
    <div>
      <div className="grid grid-cols-12 gap-6 mt-6">
        {tutors.data.list.map((tutor) => (
          <div
            key={tutor.id}
            className="col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3"
          >
            <TutorCard tutor={tutor} />
          </div>
        ))}
      </div>
      <PaginationButtons
        next={next}
        prev={prev}
        gotoFirstPage={gotoFirstPage}
        gotoLastPage={gotoLastPage}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
};

export default TutorList;
