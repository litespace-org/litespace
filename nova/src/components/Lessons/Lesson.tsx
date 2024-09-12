import React, { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import { Element, ICall, ILesson, IUser } from "@litespace/types";
import { useIntl } from "react-intl";
import { Avatar, Button, Card, messages } from "@litespace/luna";
import { asFullAssetUrl } from "@/lib/atlas";
import WatchLesson from "./WatchLesson";
import { useRender } from "@/hooks/render";

const Lesson: React.FC<
  Element<ILesson.FindUserLessonsApiResponse["list"]> & { user: IUser.Self }
> = ({ lesson, call, members, user }) => {
  const intl = useIntl();
  const watch = useRender();
  const otherMember = useMemo(() => {
    return members.find((member) => member.userId !== user.id) || null;
  }, [members, user.id]);

  const title = useMemo(() => {
    return intl.formatMessage(
      { id: messages["page.lessons.watch.dialog.title"] },
      { name: otherMember?.name.ar || "" }
    );
  }, [intl, otherMember?.name.ar]);

  return (
    <Card className="w-[900px]">
      <div className="flex flex-row items-center justify-start gap-2 mb-2">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Avatar
            src={
              otherMember?.photo
                ? asFullAssetUrl(otherMember.photo)
                : "/avatar-1.png"
            }
          />
        </div>
        <div>
          <p>{otherMember?.name.ar}</p>
          <p className="text-sm text-foreground-lighter">
            {intl.formatMessage(
              { id: messages["global.labels.call.start.with.duration"] },
              {
                start: dayjs(call.start).fromNow(),
                duration: call.duration,
                time: dayjs(call.start).format("h:mm a"),
              }
            )}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <Button onClick={watch.show}>
          {intl.formatMessage({ id: messages["global.labels.watch.lesson"] })}
        </Button>
      </div>

      <WatchLesson
        // open={watch.open}
        open={watch.open}
        close={watch.hide}
        // callId={call.id}
        callId={1}
        title={title}
      />
    </Card>
  );
};

export default Lesson;
