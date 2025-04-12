import { useLogger } from "@litespace/headless/logger";
import { Replace } from "@litespace/types";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { isInteger } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Content from "@/components/LessonV5/Content";
import { useUserContext } from "@litespace/headless/context/user";
import cn from "classnames";

type Params = Replace<UrlParamsOf<Web.Lesson>, "id", string>;

const LessonV5: React.FC = () => {
  const params = useParams<Params>();
  const logger = useLogger();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const lessonId = useMemo(() => {
    const id = Number(params.id);
    if (!isInteger(id)) {
      logger.error(`Invalid lesson id: ${params.id}`);
      return null;
    }
    return id;
  }, [logger, params.id]);

  useEffect(() => {
    if (!lessonId || !user) return navigate(Web.Root);
  }, [lessonId, navigate, user]);

  if (!lessonId || !user) return null;

  return (
    <div
      className={cn(
        // Standard page layout styles.
        "max-h-screen p-4",
        // The pre-session page is design to take the full screen.
        "flex-1 overflow-hidden"
      )}
    >
      <Content lessonId={lessonId} self={user} />
    </div>
  );
};

export default LessonV5;
