import { IMessage, Void } from "@litespace/types";
import React, { useMemo, useState } from "react";
import cn from "classnames";
import More from "@litespace/assets/More";
import { Menu } from "@/components/Menu";
import { useFormatMessage } from "@/hooks";
import MessageEdit from "@litespace/assets/MessageEdit";
import Trash from "@litespace/assets/Trash";
import { Typography } from "@/components/Typography";
import MessageCap from "@litespace/assets/MessageCap";
import AlertCircle from "@litespace/assets/AlertCircle";
import Send2 from "@litespace/assets/Send2";
import SingleCheck from "@litespace/assets/SingleCheck";
import DoubleCheck from "@litespace/assets/DoubleCheck";

/**
 * There are now 4 states of a message:
 *  - Sent  => (no props)
 *  - Pending => pending: true, error: false
 *  - Error => pending: false, error: true
 *  - Retrying => pending: true, error:true
 *
 * This is beside the 2 types of message:
 *  - Owner: The messages you send to the user
 *  - Reciever: The messages You get from the other user
 */
export const ChatMessage: React.FC<{
  /**
   * A flag that indicates whether current user is the owner of the message
   */
  owner?: boolean;
  /**
   * A flag that indicates an error occured while sending the message
   */
  error?: boolean;
  /**
   * A flag that removes the menu, it's used to show message in editing and deleting dialogs
   */
  viewOnly?: boolean;
  /**
   * A flag that indicates current message is being sent to the other user
   */
  pending?: boolean;
  /**
   * content of the message
   * @param id message id
   * @param text message content
   */
  message: { id: number; text: string };
  messageState?: IMessage.MessageState;
  firstMessage?: boolean;
  /**
   * resend message function
   */
  retry?: Void | null;
  /**
   * edit message function, used to open the edit dialog
   */
  editMessage?: Void;
  /**
   * delete message function, used to open the delete dialog
   */
  deleteMessage?: Void;
}> = ({
  message,
  owner,
  viewOnly,
  pending,
  error,
  messageState,
  firstMessage,
  retry,
  editMessage,
  deleteMessage,
}) => {
  const intl = useFormatMessage();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const ReadIcon = useMemo(() => {
    if (messageState === "seen")
      return <DoubleCheck className="[&>*]:tw-fill-secondary-400" />;
    return <SingleCheck />;
  }, [messageState]);

  const menuItems = useMemo(() => {
    if (error)
      return [
        {
          label: intl("chat.message.retry"),
          onClick: () => retry && retry(),
          icon: <Send2 className="tw-w-4 tw-h-4" />,
        },
      ];
    return [
      {
        label: intl("chat.message.edit"),
        onClick: editMessage,
        icon: <MessageEdit />,
      },
      {
        label: intl("chat.message.delete"),
        onClick: deleteMessage,
        icon: <Trash className="tw-w-4 tw-h-4" />,
      },
    ];
  }, [error, deleteMessage, retry, editMessage, intl]);

  return (
    <div
      className={cn("tw-group tw-flex tw-w-fit", "tw-gap-4 tw-items-center", {
        "tw-flex-row-reverse": owner,
        "tw-flex-row": !owner,
      })}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        if (openMenu) return;
        setShowMenu(false);
      }}
    >
      {!pending && owner ? (
        <div
          data-show={showMenu || !!error}
          className={cn(
            "lg:tw-opacity-0 data-[show=true]:tw-opacity-100 tw-transition-opacity tw-duration-200",
            viewOnly && "tw-hidden"
          )}
        >
          <Menu
            actions={menuItems}
            open={openMenu}
            setOpen={(open: boolean) => {
              if (!open) setShowMenu(false);
              setOpenMenu(open);
            }}
          >
            <div className="tw-w-4 tw-h-6 tw-flex tw-justify-center tw-items-center">
              <More className="[&>*]:tw-fill-natural-800 dark:[&>*]:tw-fill-natural-50" />
            </div>
          </Menu>
        </div>
      ) : null}

      <div
        className={cn(
          "tw-rounded-[15px] tw-relative tw-p-2 tw-max-w-[242px] lg:tw-max-w-[324px]",
          "tw-flex tw-items-end tw-gap-2 tw-justify-start",
          pending && "tw-cursor-wait tw-opacity-50",
          {
            "tw-bg-natural-100 dark:tw-bg-brand-100 ": !owner,
            "tw-bg-brand-100 dark:tw-bg-brand-400": owner,
            "tw-bg-destructive-700": error && !pending,
          },
          {
            "tw-rounded-tl-none": !owner && firstMessage,
            "tw-rounded-tr-none": owner && firstMessage,
          }
        )}
      >
        {firstMessage ? (
          <MessageCap
            className={cn("-tw-top-1 tw-absolute", {
              "-tw-right-0 [&>*]:tw-fill-brand-100 dark:[&>*]:tw-fill-brand-400":
                owner,
              "-tw-right-0 [&>*]:tw-fill-destructive-700": error && !pending,
              "-tw-left-0 tw-scale-x-[-1] [&>*]:tw-fill-natural-100 dark:[&>*]:tw-fill-brand-100":
                !owner,
            })}
          />
        ) : null}
        {error ? (
          <div
            className={cn(
              "tw-w-4 tw-h-4 tw-rounded-full tw-bg-destructive-500 tw-shadow-alert-circle",
              "tw-flex tw-items-center tw-justify-center tw-shrink-0"
            )}
          >
            <AlertCircle className="tw-w-[10px] tw-h-[10px]" />
          </div>
        ) : null}
        {owner && !error && !pending ? (
          <div className="tw-w-4 tw-h-4 tw-shrink-0">{ReadIcon}</div>
        ) : null}
        <Typography
          element="caption"
          weight="regular"
          style={{
            lineBreak: "anywhere",
          }}
          className={cn(
            "tw-flex tw-items-end tw-gap-2 tw-max-w-[198px] lg:tw-max-w-[310px]",
            {
              "tw-text-natural-950": !error,
              "tw-text-natural-50": error && !pending,
            }
          )}
        >
          {message.text}
        </Typography>
      </div>
    </div>
  );
};
