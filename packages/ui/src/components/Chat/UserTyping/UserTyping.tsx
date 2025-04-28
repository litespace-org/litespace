import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { optional } from "@litespace/utils/utils";
import { IUser } from "@litespace/types";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { motion } from "framer-motion";

export const UserTyping: React.FC<{
  /**
   * The user id. It will be used as the avatar seed.
   */
  id: number;
  /**
   * The user name. It will not be displayed in case it was `null`
   */
  name: string | null;
  /**
   * The full user image url.
   *
   * @note backup avatar will be displayed as the user image incase `imageUrl`
   * is not provided  or the url was not valid.
   */
  imageUrl: string | null;
  /**
   * The user gender. It will be used to render the right text semantics based
   * on the user gender. Default is the `male`.
   */
  gender: IUser.Gender | null;
  /**
   * @description display time offset in milliseconds.
   * How long the component should be rendered before it is unmounted.
   * @default 1.5 // one and half second
   */
  offset?: number;
}> = ({
  id,
  name,
  imageUrl,
  gender,
  offset = 1.5, // 1.5 second
}) => {
  const intl = useFormatMessage();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 1, 1, 0.7, 0] }}
        transition={{
          repeat: Infinity,
          duration: offset,
          ease: "linear",
        }}
        exit={{ opacity: 0 }}
        className="flex flex-row items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden">
          <Avatar
            src={optional(imageUrl)}
            alt={optional(name)}
            seed={id.toString()}
          />
        </div>
        <div>
          {name ? (
            <Typography tag="span" className="text-natural-950 text-caption">
              {name}
            </Typography>
          ) : null}
          &nbsp;
          <Typography tag="span" className="text-natural-400 text-caption">
            {gender === IUser.Gender.Male || gender === null
              ? intl("chat.typing-now.male")
              : intl("chat.typing-now.female")}
          </Typography>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
