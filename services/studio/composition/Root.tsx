import { Composition } from "remotion";
import { Stream, schema } from "composition/Stream";
import { faker } from "lib/faker";
import { FPS, SECONDS_IN_MINUTE } from "lib/constants";
import dayjs from "lib/dayjs";

import "@litespace/ui/tailwind.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {["stream", "user-stream", "screen-stream"].map((id) => (
        <Composition
          key={id}
          id={id}
          durationInFrames={FPS * 10}
          fps={FPS}
          width={1920}
          height={1080}
          component={Stream}
          schema={schema}
          defaultProps={{
            id: faker.number.int(),
            name: faker.person.fullName(),
            image: faker.image.urlLoremFlickr({
              width: 400,
              height: 400,
            }),
            start: dayjs().startOf("hour").toISOString(),
            duration: 30,
            screen: id === "screen-stream",
          }}
          calculateMetadata={({ props }) => {
            return {
              durationInFrames: props.duration * SECONDS_IN_MINUTE * FPS,
            };
          }}
        />
      ))}
    </>
  );
};
