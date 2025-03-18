import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import dayjs from "@/lib/dayjs";
import EmptyChatSummary from "@litespace/assets/EmptyChatsSummary";
import { Void } from "@litespace/types";
import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";

export type ChatSummaryProps = {
  rooms: Array<{
    id: number;
    /**
     * Chat room url.
     */
    url: string;
    otherMember: {
      id: number;
      name: string | null;
      image: string | null;
      online: boolean;
    };
    /**
     * Text of the latest message sent in the room.
     */
    message?: string | null;
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
  loading?: boolean;
  error?: boolean;
  retry?: Void;
};

export const ChatSummary: React.FC<ChatSummaryProps> = ({
  loading,
  error,
  rooms,
  retry,
  chatsUrl,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  return (
    <div
      className={cn(
        "border border-transparent hover:border-natural-100 rounded-lg p-4 sm:p-6 shadow-ls-x-small bg-natural-50 flex flex-col"
      )}
    >
      <Typography
        tag="h2"
        className="text-natural-950 text-base sm:text-subtitle-2 font-bold"
      >
        {intl("student-dashboard.chat.title")}
      </Typography>

      {error && retry && !loading ? (
        <div className="w-full h-96 flex justify-center items-center">
          <LoadingError
            size={mq.md ? "medium" : "small"}
            error={intl("student-dashboard.chat-summary.error")}
            retry={retry}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="w-full h-96 flex justify-center items-center">
          <Loader
            size={mq.md ? "medium" : "small"}
            text={intl("student-dashboard.chat-summary.loading")}
          />
        </div>
      ) : null}

      {rooms && !error && !loading ? (
        <>
          <div>
            {rooms.length ? (
              <div className="my-4 flex flex-col gap-4">
                {rooms.map((room) => {
                  return (
                    <Link
                      to={room.url}
                      key={room.id}
                      className="group w-full flex gap-2 p-1"
                    >
                      <div className="min-w-[43px] min-h-[43px] w-[43px] h-[43px] rounded-lg overflow-hidden">
                        <Avatar
                          src={room.otherMember.image}
                          seed={room.otherMember.id.toString()}
                          alt={room.otherMember.name}
                          object="cover"
                        />
                      </div>
                      <div className="flex flex-col grow justify-between">
                        <div className="flex justify-between self-stretch">
                          <Typography
                            tag="span"
                            className="text-natural-950 text-caption font-semibold"
                          >
                            {room.otherMember.name}
                          </Typography>
                          <Typography
                            tag="span"
                            className={cn(
                              "text-tiny font-normal",
                              room.read ? "text-brand-700" : "text-natural-600"
                            )}
                          >
                            {dayjs(room.sentAt).format("hh:mm a")}
                          </Typography>
                        </div>
                        <Typography
                          tag="span"
                          className={cn(
                            "text-caption font-normal",
                            "line-clamp-1",
                            room.message && room.read
                              ? "text-brand-700"
                              : "text-natural-600"
                          )}
                        >
                          {room.message ||
                            intl(
                              room.otherMember.online
                                ? "chat.active"
                                : "chat.inactive"
                            )}
                        </Typography>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyChats />
            )}
          </div>
          {!isEmpty(rooms) ? (
            <Link to={chatsUrl} className="intline-block w-full mt-auto">
              <Button className="w-full" size="large">
                <Typography
                  tag="span"
                  className="text-natural-50 text-caption font-semibold"
                >
                  {intl("student-dashboard.button.find-chats")}
                </Typography>
              </Button>
            </Link>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

const EmptyChats = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center gap-6 mb-12 mt-8 lg:mt-6">
      <EmptyChatSummary className="w-[204px] h-[140px] lg:w-[228px] lg:h-[156px]" />
      <Typography
        tag="span"
        className="text-natural-950 text-caption sm:text-subtitle-1 font-bold sm:font-semibold"
      >
        {intl("student-dashboard.empty-chats")}
      </Typography>
    </div>
  );
};

export default ChatSummary;
