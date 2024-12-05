import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { orUndefined } from "@litespace/sol/utils";
import { IUser } from "@litespace/types";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
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
   * Random id used to force the component to re-render.
   */
  seed?: number;
  /**
   * @description display time offset in milliseconds.
   *
   * How long the component should be rendered before it is unmounted.
   *
   * @default 1000 // one second
   */
  offset?: number;
}> = ({
  id,
  name,
  imageUrl,
  gender,
  seed,
  offset = 1_000, // 1 second
}) => {
  const intl = useFormatMessage();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (!seed) return;

    setShow(true);

    const timeout = setTimeout(() => {
      setShow(false);
    }, offset);

    return () => {
      clearTimeout(timeout);
    };
  }, [offset, seed]);

  return (
    <AnimatePresence mode="wait">
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="tw-flex tw-flex-row tw-items-end tw-gap-2"
        >
          <div className="tw-animate-pulse tw-duration-150">
            {name ? (
              <Typography element="caption" className="tw-text-natural-950">
                {name}
              </Typography>
            ) : null}
            &nbsp;
            <Typography element="caption" className="tw-text-natural-400">
              {gender === IUser.Gender.Male || gender === null
                ? intl("chat.typing-now.male")
                : intl("chat.typing-now.female")}
            </Typography>
          </div>
          <div className="tw-w-7 tw-h-7 tw-rounded-full tw-overflow-hidden">
            <Avatar
              src={orUndefined(imageUrl)}
              alt={orUndefined(name)}
              seed={id.toString()}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
