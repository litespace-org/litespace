import { IMessage } from "@litespace/types";
import React, { useState } from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import More from "@litespace/assets/More";
import { Menu } from "@/components/Menu";
import { useFormatMessage } from "@/hooks";
import MessageEdit from "@litespace/assets/MessageEdit";
import Trash from "@litespace/assets/Trash";

export const ChatMessage: React.FC<{
  message: IMessage.Self;
  owner?: boolean;
  editMessage: (message: IMessage.Self) => void;
  deleteMessage: (messageId: number) => void;
}> = ({ message, owner, editMessage, deleteMessage }) => {
  const intl = useFormatMessage();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "tw-group tw-flex tw-w-fit",
        "tw-gap-[14px] tw-items-start",
        {
          "tw-flex-row-reverse": owner,
          "tw-flex-row": !owner,
        }
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        if (openMenu) return;
        setShowMenu(false);
      }}
    >
      <div
        data-show={showMenu}
        className="tw-opacity-0 data-[show=true]:tw-opacity-100 tw-transition-opacity tw-duration-200"
      >
        <Menu
          actions={[
            {
              label: intl("chat.message.edit"),
              onClick: () => editMessage(message),
              icon: <MessageEdit />,
            },
            {
              label: intl("chat.message.delete"),
              onClick: () => deleteMessage(message.id),
              icon: <Trash />,
            },
          ]}
          open={openMenu}
          setOpen={(open: boolean) => {
            if (!open) setShowMenu(false);
            setOpenMenu(open);
          }}
        >
          <div className="tw-w-6 tw-h-6 tw-flex tw-justify-center tw-items-center">
            <More className="[&>*]:tw-fill-natural-800 dark:[&>*]:tw-fill-natural-50" />
          </div>
        </Menu>
      </div>
      <div
        className={cn("tw-rounded-[15px] tw-relative tw-px-6 tw-py-3", {
          "tw-bg-brand-100 dark:tw-bg-brand-100": !owner,
          "tw-bg-brand-700 dark:tw-bg-brand-400": owner,
        })}
      >
        {!owner ? (
          <div
            className={cn(
              "tw-absolute -tw-top-[10px] tw-left-[0px] tw-w-0 tw-h-0",
              "tw-rounded-t-full tw-rounded-r-full",
              "tw-border-r-[40px]  tw-border-b-[22px]",
              "tw-border-r-transparent tw-border-b-brand-100 dark:tw-border-b-brand-100"
            )}
          />
        ) : (
          <div
            className={cn(
              "tw-absolute -tw-top-[10px] tw-right-[0px] tw-w-0 tw-h-0",
              "tw-rounded-t-full tw-rounded-l-full",
              "tw-border-l-[40px]  tw-border-b-[22px]",
              "tw-border-l-transparent tw-border-b-brand-700 dark:tw-border-b-brand-400"
            )}
          />
        )}
        <Typography
          element="caption"
          className={cn("tw-font-normal", {
            "tw-text-natural-950 dark:tw-text-secondary-900": !owner,
            "tw-text-natural-50 dark:tw-text-secondary-900": owner,
          })}
        >
          {message.text}
        </Typography>
      </div>
    </div>
  );
};
