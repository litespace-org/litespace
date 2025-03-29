import React from "react";
import { AbsoluteFill, Img } from "remotion";
import zod from "zod";
import { JazzIcon } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import dayjs from "@/lib/dayjs";

export const schema = zod.object({
  name: zod.string().or(zod.null()),
  id: zod.number().positive().int(),
  image: zod.string().url().or(zod.null()),
  start: zod.string().datetime(),
  duration: zod.coerce.number().int(),
  screen: zod.boolean().optional().default(false),
});

export type Props = zod.infer<typeof schema>;

const Screen: React.FC<Props> = ({ image, start, duration, name }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {image ? (
        <Img src={image} className="w-full h-full object-contain" />
      ) : (
        `Screen`
      )}

      <div className="absolute right-12 bottom-12 bg-natural-900 p-5 rounded-2xl">
        <Typography tag="h2" className="text-h2 text-natural-50">
          {name}
        </Typography>
        <Typography tag="p" className="text-subtitle-1 text-natural-50">
          {dayjs(start).format("HH:mm a")} -{" "}
          {dayjs(start).add(duration, "minutes").format("HH:mm a")}
        </Typography>
      </div>
    </div>
  );
};

const User: React.FC<Props> = ({ image, id, name, start, duration }) => {
  return (
    <>
      <div className="w-96 h-96 rounded-full overflow-hidden">
        {image ? <Img src={image} /> : <JazzIcon seed={id} />}
      </div>

      <div className="mt-6">
        <Typography tag="h2" className="text-h2">
          {name}
        </Typography>
        <Typography tag="p" className="text-subtitle-1">
          {dayjs(start).format("HH:mm a")} -{" "}
          {dayjs(start).add(duration, "minutes").format("HH:mm a")}
        </Typography>
      </div>
    </>
  );
};

export const Stream: React.FC<Props> = (props) => {
  return (
    <AbsoluteFill
      dir="rtl"
      className="flex items-center justify-center bg-natural-50 text-center"
    >
      {props.screen ? <Screen {...props} /> : <User {...props} />}
    </AbsoluteFill>
  );
};
