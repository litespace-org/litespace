import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import EmptyChatSummary from "@litespace/assets/EmptyChatsSummary";
import { orUndefined } from "@litespace/sol/utils";
import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  rooms: Array<{
    id: number;
    /**
     * Chat room url.
     */
    url: string;
    /**
     * Other member name
     */
    name?: string | undefined;
    /**
     * Full image url
     */
    image?: string | undefined;
    /**
     * Text of the latest message sent in the room.
     */
    message: string | undefined;
    /**
     * ISO UTC datetime that the latest message was sent at.
     */
    sentAt: string;
    /**
     * Should be true incase of the latest message was read by the user.
     */
    read: boolean;
  }>;
  /**
   * Chats room url
   */
  chatsUrl: string;
};

export const ChatSummary: React.FC<Props> = ({ rooms, chatsUrl }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-rounded-lg tw-p-6 tw-shadow-ls-small tw-bg-natural-50"
      )}
    >
      <Typography
        element="subtitle-2"
        weight="bold"
        className="tw-text-natural-950"
      >
        {intl("student-dashboard.chat.title")}
      </Typography>
      <div>
        {rooms.length ? (
          <div className="tw-mt-4 tw-mb-[19px] tw-flex tw-flex-col tw-gap-4">
            {rooms.map((room) => {
              return (
                <Link to={room.url} key={room.id} className="group">
                  <div className="tw-flex tw-gap-2 tw-w-full">
                    <div className="tw-min-w-[42px] tw-min-h-[42px] tw-w-[42px] tw-h-[42px] tw-rounded-full tw-overflow-hidden">
                      <Avatar
                        src={orUndefined(room.image)}
                        seed={room.id.toString()}
                        alt={orUndefined(room.name)}
                      />
                    </div>
                    <div className="tw-flex tw-flex-col tw-justify-between">
                      <div className="tw-flex tw-justify-between tw-self-stretch">
                        <Typography
                          element="caption"
                          weight="semibold"
                          className="tw-text-natural-950"
                        >
                          {room.name}
                        </Typography>
                        <Typography
                          element="tiny-text"
                          weight="regular"
                          className={cn(
                            room.read
                              ? "tw-text-brand-700"
                              : "tw-text-natural-600"
                          )}
                        >
                          {dayjs(room.sentAt).format("hh:mm a")}
                        </Typography>
                      </div>
                      <Typography
                        element="caption"
                        weight="regular"
                        className={cn(
                          "tw-line-clamp-1",
                          room.read
                            ? "tw-text-brand-700"
                            : "tw-text-natural-600"
                        )}
                      >
                        {room.message}
                      </Typography>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyChats />
        )}
      </div>
      <Link to={chatsUrl} className="tw-intline-block tw-w-full">
        <Button className="tw-w-full" size={ButtonSize.Tiny}>
          <Typography
            element="caption"
            weight="semibold"
            className="tw-text-natural-50"
          >
            {intl("student-dashboard.button.find-chats")}
          </Typography>
        </Button>
      </Link>
    </div>
  );
};

const EmptyChats = () => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-gap-6 tw-mb-[39px] tw-mt-6">
      <EmptyChatSummary />
      <Typography
        element="subtitle-1"
        weight="semibold"
        className="tw-text-natural-950"
      >
        {intl("student-dashboard.empty-chats")}
      </Typography>
    </div>
  );
};

export default ChatSummary;
