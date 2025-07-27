import { useLogger } from "@litespace/headless/logger";
import { Replace } from "@litespace/types";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { isInteger } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Content from "@/components/DemoSession/Content";
import { useUser } from "@litespace/headless/context/user";
import cn from "classnames";

type Params = Replace<UrlParamsOf<Web.DemoSession>, "id", string>;

const DemoSession: React.FC = () => {
  const params = useParams<Params>();
  const logger = useLogger();
  const navigate = useNavigate();
  const { user } = useUser();

  const demoSessionId = useMemo(() => {
    const id = Number(params.id);
    if (!isInteger(id)) {
      logger.error(`Invalid demo session id: ${params.id}`);
      return null;
    }
    return id;
  }, [logger, params.id]);

  useEffect(() => {
    if (!demoSessionId || !user) return navigate(Web.Root);
  }, [demoSessionId, navigate, user]);

  if (!demoSessionId || !user) return null;

  return (
    <div className={cn("flex-1 overflow-hidden p-4")}>
      <Content demoSessionId={demoSessionId} self={user} />
    </div>
  );
};

export default DemoSession;
