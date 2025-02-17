import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import dayjs from "@/lib/dayjs";
import EmptyChatSummary from "@litespace/assets/EmptyChatsSummary";
import { orUndefined } from "@litespace/utils/utils";
import { Void } from "@litespace/types";
import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";

export type ChatSummaryProps = {
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
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-rounded-lg tw-p-4 sm:tw-p-6 tw-shadow-ls-x-small tw-bg-natural-50"
      )}
    >
      <Typography
        tag="h1"
        className="tw-text-natural-950 tw-text-base sm:tw-text-xl tw-font-bold"
      >
        {intl("student-dashboard.chat.title")}
      </Typography>

      {error && retry && !loading ? (
        <div className="tw-w-full tw-h-96 tw-flex tw-justify-center tw-items-center">
          <LoadingError
            size={mq.sm ? "medium" : "small"}
            error={intl("student-dashboard.chat-summary.error")}
            retry={retry}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="tw-w-full tw-h-96 tw-flex tw-justify-center tw-items-center">
          <Loader
            size={mq.sm ? "medium" : "small"}
            text={intl("student-dashboard.chat-summary.loading")}
          />
        </div>
      ) : null}

      {rooms && !error && !loading ? (
        <>
          <div>
            {rooms.length ? (
              <div className="tw-mt-4 tw-mb-[19px] tw-flex tw-flex-col tw-gap-4">
                {rooms.map((room) => {
                  return (
                    <Link
                      to={room.url}
                      key={room.id}
                      className="tw-group tw-w-full tw-flex tw-gap-2 "
                    >
                      <div className="tw-min-w-[42px] tw-min-h-[42px] tw-w-[42px] tw-h-[42px] tw-rounded-lg tw-overflow-hidden">
                        <Avatar
                          src={orUndefined(room.image)}
                          seed={room.id.toString()}
                          alt={orUndefined(room.name)}
                        />
                      </div>
                      <div className="tw-flex tw-flex-col tw-grow tw-justify-between">
                        <div className="tw-flex tw-justify-between tw-self-stretch">
                          <Typography
                            tag="label"
                            className="tw-text-natural-950 tw-text-sm tw-font-semibold"
                          >
                            {room.name}
                          </Typography>
                          <Typography
                            tag="label"
                            className={cn(
                              "tw-text-xs tw-font-normal",
                              room.read
                                ? "tw-text-brand-700"
                                : "tw-text-natural-600"
                            )}
                          >
                            {dayjs(room.sentAt).format("hh:mm a")}
                          </Typography>
                        </div>
                        <Typography
                          tag="label"
                          className={cn(
                            "tw-text-sm tw-font-normal",
                            "tw-line-clamp-1",
                            room.read
                              ? "tw-text-brand-700"
                              : "tw-text-natural-600"
                          )}
                        >
                          {room.message}
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
          <Link to={chatsUrl} className="tw-intline-block tw-w-full">
            <Button className="tw-w-full" size="large">
              <Typography
                tag="label"
                className="tw-text-natural-50 tw-text-sm tw-font-semibold"
              >
                {intl("student-dashboard.button.find-chats")}
              </Typography>
            </Button>
          </Link>
        </>
      ) : null}
    </div>
  );
};

const EmptyChats = () => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-gap-6 tw-mb-12 tw-mt-8 lg:tw-mt-6">
      <EmptyChatSummary />
      <Typography
        tag="label"
        className="tw-text-natural-950 tw-text-sm sm:tw-text-2xl tw-font-bold sm:tw-font-semibold"
      >
        {intl("student-dashboard.empty-chats")}
      </Typography>
    </div>
  );
};

export default ChatSummary;
