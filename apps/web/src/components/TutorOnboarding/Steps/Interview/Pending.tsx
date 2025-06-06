import React from "react";
import Header from "@/components/TutorOnboarding/Steps/Interview/Header";
import { Element, IInterview, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Link } from "react-router-dom";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { useUpdateInterview } from "@litespace/headless/interviews";

const Pending: React.FC<{
  interview: Element<IInterview.FindApiResponse["list"]>;
  sync: Void;
  syncing: boolean;
}> = ({ interview, sync, syncing }) => {
  return (
    <div className="w-full py-14 flex flex-col items-center gap-14">
      <Header tutor={interview.interviewer.name} />
      <Interview interviewId={interview.id} sync={sync} syncing={syncing} />
    </div>
  );
};

const Interview: React.FC<{
  interviewId: number;
  sync: Void;
  syncing: boolean;
}> = ({ interviewId, sync, syncing }) => {
  const update = useUpdateInterview({
    onSuccess() {
      sync();
    },
  });

  return (
    <div className="border border-natural-100 rounded-lg w-full max-w-[490px] p-4">
      <div className="flex flex-row gap-4 items-center justify-center">
        <Link
          to={router.web({ route: Web.Interview, id: interviewId })}
          tabIndex={-1}
          className="flex-1"
        >
          <Button
            disabled={update.isPending || syncing}
            size="large"
            className="w-full"
          >
            Join
          </Button>
        </Link>
        <Button
          size="large"
          variant="secondary"
          className="flex-1"
          disabled={update.isPending || syncing}
          loading={update.isPending}
          onClick={() =>
            update.mutate({
              id: interviewId,
              status: IInterview.Status.CanceledByInterviewee,
            })
          }
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Pending;
