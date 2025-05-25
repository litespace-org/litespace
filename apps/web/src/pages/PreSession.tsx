import { useUser } from "@litespace/headless/context/user";
import { ISession, Replace } from "@litespace/types";
import { isValidSessionType } from "@litespace/utils";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { isInteger } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Content from "@/components/PreSession/Content";
import { useFindLesson } from "@litespace/headless/lessons";
import { useOnError } from "@/hooks/error";

type Params = Replace<UrlParamsOf<Web.PreSession>, "id", string>;

const PreSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const params = useParams<Params>();

  const resourceId = useMemo((): number | null => {
    const id = Number(params.id);
    if (!isInteger(id)) return null;
    return id;
  }, [params.id]);

  const type = useMemo((): ISession.Type | null => {
    const type = params.type;
    if (!isValidSessionType(type)) return null;
    return type;
  }, [params.type]);

  const { query: lessonQuery, keys: lessonQueryKeys } = useFindLesson(
    type === "lesson" && resourceId ? resourceId : undefined
  );

  useOnError({
    type: "query",
    keys: lessonQueryKeys,
    error: lessonQuery.error,
  });

  useEffect(() => {
    if (!resourceId || !type || !user?.id) return navigate(Web.Root);
  }, [navigate, resourceId, type, user?.id]);

  if (!resourceId || !type || !user) return;

  return (
    <div className="max-w-screen-3xl mx-auto w-full p-4 sm:p-6">
      <Content type={type} resourceId={resourceId} user={user} />
    </div>
  );
};

export default PreSession;
