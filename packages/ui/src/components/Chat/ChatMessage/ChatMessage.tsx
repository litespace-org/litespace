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
  inSession?: boolean;
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
  inSession,
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
      return <DoubleCheck className="[&>*]:fill-secondary-400" />;
    return <SingleCheck />;
  }, [messageState]);

  const menuItems = useMemo(() => {
    if (error)
      return [
        {
          label: intl("chat.message.retry"),
          onClick: () => retry && retry(),
          icon: <Send2 className="w-4 h-4" />,
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
        icon: <Trash className="w-4 h-4" />,
      },
    ];
  }, [error, deleteMessage, retry, editMessage, intl]);

  return (
    <div
      className={cn("group flex w-fit", "gap-4 items-center", {
        "flex-row-reverse": owner,
        "flex-row": !owner,
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
            "lg:opacity-0 data-[show=true]:opacity-100 transition-opacity duration-200",
            viewOnly && "hidden"
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
            <div className="w-4 h-6 flex justify-center items-center">
              <More className="[&>*]:fill-natural-800 dark:[&>*]:fill-natural-50 w-4 h-1" />
            </div>
          </Menu>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-[15px] relative p-2 max-w-[242px] lg:max-w-[324px]",
          "flex items-end gap-2 justify-start",
          pending && "cursor-wait opacity-50",
          {
            "bg-natural-100 dark:bg-brand-100 ": !owner,
            "bg-brand-100 dark:bg-brand-400": owner,
            "bg-destructive-700": error && !pending,
          },
          {
            "rounded-tl-none": !owner && firstMessage,
            "rounded-tr-none": owner && firstMessage,
          }
        )}
      >
        {firstMessage ? (
          <MessageCap
            className={cn("-top-1 absolute", {
              "-right-0 [&>*]:fill-brand-100 dark:[&>*]:fill-brand-400": owner,
              "-right-0 [&>*]:fill-destructive-700": error && !pending,
              "-left-0 scale-x-[-1] [&>*]:fill-natural-100 dark:[&>*]:fill-brand-100":
                !owner,
            })}
          />
        ) : null}
        {error ? (
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-destructive-500 shadow-alert-circle",
              "flex items-center justify-center shrink-0"
            )}
          >
            <AlertCircle className="w-[10px] h-[10px]" />
          </div>
        ) : null}
        {owner && !error && !pending ? (
          <div className="w-4 h-4 shrink-0">{ReadIcon}</div>
        ) : null}
        <Typography
          dir="auto"
          tag="span"
          style={{
            lineBreak: "anywhere",
          }}
          className={cn(
            "flex items-end gap-2 max-w-[198px] lg:max-w-[310px] font-normal",
            inSession && !owner ? "text-tiny" : "text-caption",
            {
              "text-natural-950": !error,
              "text-natural-50": error && !pending,
            }
          )}
        >
          {message.text}
        </Typography>
      </div>
    </div>
  );
};
