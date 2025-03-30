import { Composition } from "remotion";
import Stream, { schema as streamSchema } from "composition/Stream";
import Session, { schema as sessionSchema } from "composition/Session";
import { faker } from "@/lib/faker";
import { FPS, SECONDS_IN_MINUTE } from "lib/constants";
import dayjs from "@/lib/dayjs";
import { sessionCompositionProps } from "@/lib/session";

import "@litespace/ui/tailwind.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {["stream", "test-user-stream", "test-screen-stream"].map((id) => (
        <Composition
          key={id}
          id={id}
          durationInFrames={FPS * 10}
          fps={FPS}
          width={1920}
          height={1080}
          component={Stream}
          schema={streamSchema}
          defaultProps={{
            id: faker.number.int(),
            name: faker.person.fullName(),
            image: faker.image.urlLoremFlickr({
              width: 400,
              height: 400,
            }),
            start: dayjs().startOf("hour").toISOString(),
            duration: 30,
            screen: id === "test-screen-stream",
          }}
          calculateMetadata={({ props }) => {
            return {
              durationInFrames: props.duration * SECONDS_IN_MINUTE * FPS,
            };
          }}
        />
      ))}

      <Composition
        id="session"
        durationInFrames={FPS * 60 * 30}
        fps={FPS}
        schema={sessionSchema}
        width={1920}
        height={1080}
        defaultProps={sessionCompositionProps}
        component={Session}
      />
    </>
  );
};
