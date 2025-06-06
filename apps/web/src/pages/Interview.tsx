import Content from "@/components/Interview/Content";
import { useUser } from "@litespace/headless/context/user";
import { useLogger } from "@litespace/headless/logger";
import { Replace } from "@litespace/types";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { isInteger } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Params = Replace<UrlParamsOf<Web.Lesson>, "id", string>;

const Interview: React.FC = () => {
  const params = useParams<Params>();
  const logger = useLogger();
  const navigate = useNavigate();
  const { user } = useUser();

  const interviewId = useMemo(() => {
    const id = Number(params.id);
    if (!isInteger(id)) {
      logger.error(`invalid interview id: ${params.id}`);
      return null;
    }
    return id;
  }, [logger, params.id]);

  useEffect(() => {
    if (!interviewId || !user) return navigate(Web.Root);
  }, [interviewId, navigate, user]);

  if (!interviewId || !user) return null;

  return (
    <div className="flex-1 overflow-hidden p-4">
      <Content interviewId={interviewId} self={user} />
    </div>
  );
};

export default Interview;
