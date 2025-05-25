import { useLogger } from "@litespace/headless/logger";
import { Replace } from "@litespace/types";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { isInteger } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Content from "@/components/Lesson/Content";
import { useUser } from "@litespace/headless/context/user";
import cn from "classnames";

type Params = Replace<UrlParamsOf<Web.LessonV3>, "id", string>;

const LessonV3: React.FC = () => {
  const params = useParams<Params>();
  const logger = useLogger();
  const navigate = useNavigate();
  const { user } = useUser();

  const lessonId = useMemo(() => {
    const id = Number(params.id);
    if (!isInteger(id)) {
      logger.error(`invalid lesson id: ${params.id}`);
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
        // standard page layout styles.
        "flex-1 overflow-hidden p-4"
      )}
    >
      <Content lessonId={lessonId} self={user} />
    </div>
  );
};

export default LessonV3;
