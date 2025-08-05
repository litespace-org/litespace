import React, { useMemo } from "react";
import { useOnError } from "@/hooks/error";
import { useFindDemoSession } from "@litespace/headless/demoSessions";
import { IUser } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import Session from "@/components/Session";
import { RemoteMember } from "@/components/Session/types";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { useNavigate } from "react-router-dom";

const Content: React.FC<{
  demoSessionId: number;
  self: IUser.Self;
}> = ({ demoSessionId, self }) => {
  const navigate = useNavigate();
  const query = useFindDemoSession(demoSessionId);

  useOnError({
    type: "query",
    error: query.error,
    keys: query.keys,
  });

  const member = useMemo((): RemoteMember | null => {
    if (!query.data) return null;
    if (self.role === IUser.Role.Tutor) {
      return {
        id: query.data.tutorId,
        name: "TutorManager",
        role: IUser.Role.TutorManager,
        image: null,
      };
    } else if (self.role === IUser.Role.TutorManager) {
      // No studentId/studentName in demo session, so fallback to slotId or generic name
      return {
        id: query.data.slotId,
        name: "Tutor",
        role: IUser.Role.Tutor,
        image: null,
      };
    }
    return null;
  }, [query.data, self]);

  if (query.isPending)
    return (
      <div className="mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (query.isError || !query.data || !member)
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
        <LoadingError size="small" retry={query.refetch} />
      </div>
    );

  return (
    <Session
      type="demo"
      sessionId={query.data.sessionId}
      localMember={self}
      remoteMember={member}
      onLeave={() => {
        navigate(
          router.web({
            route: Web.Root,
          })
        );
      }}
      start={query.data.start}
      duration={60}
    />
  );
};

export default Content;
