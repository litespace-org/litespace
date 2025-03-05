import type { Meta, StoryObj } from "@storybook/react";
import { PreSession, PreSessionProps } from "@/components/Session";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import React, { useState } from "react";
import { useUserMedia } from "@/internal/hooks/stream";
import dayjs from "@/lib/dayjs";

type Component = typeof PreSession;

const meta: Meta<Component> = {
  title: "Session/PreSession",
  component: PreSession,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[425px] md:w-[780px] lg:w-[1200px]">
        <Story />
      </div>
    ),
  ],
};

const join = () => alert("join");
const toggleCamera = () => alert("toggle camera");
const toggleMic = () => alert("toggle mic");

export const WithMedia: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: { enabled: true, error: false, toggle: toggleCamera },
    audio: { enabled: true, error: false, toggle: toggleMic },
    join,
  },
  render(props: PreSessionProps) {
    const stream = useUserMedia();
    return <PreSession {...props} stream={stream} />;
  },
};

export const Controllable: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
  render(props: PreSessionProps) {
    const stream = useUserMedia();
    const [camera, setCamera] = useState<boolean>(false);
    const [mic, setMic] = useState<boolean>(false);
    return (
      <PreSession
        {...props}
        stream={stream}
        video={{ enabled: camera, toggle: () => setCamera(!camera) }}
        audio={{ enabled: mic, toggle: () => setMic(!mic) }}
      />
    );
  },
};

export const OnlyMic: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: true,
      toggle: toggleCamera,
      error: false,
    },
    speaking: true,
    join,
  },
  render(props: PreSessionProps) {
    return <PreSession {...props} />;
  },
};

export const OnlyCamera: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: {
      enabled: true,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: false,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
  render(props: PreSessionProps) {
    const stream = useUserMedia();
    return <PreSession {...props} stream={stream} />;
  },
};

export const MicProblem: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: false,
      },
      current: {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: false,
      toggle: toggleMic,
      error: true,
    },
    join,
  },
};

export const TutorInSession: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: faker.image.avatarGitHub(),
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: { enabled: false, toggle: toggleCamera, error: false },
    audio: { enabled: true, toggle: toggleMic, error: false },
    speaking: true,
    join,
  },
};

export const StudentInSession: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Student,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: faker.image.avatarGitHub(),
        name: faker.person.fullName(),
        role: IUser.Role.Tutor,
      },
    },
    session: {
      start: dayjs().add(5, "minutes").toString(),
      duration: 10,
    },
    video: { enabled: false, toggle: toggleCamera, error: false },
    audio: { enabled: true, toggle: toggleMic, error: false },
    speaking: true,
    join,
  },
};

export const FutureSession: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().add(10, "minutes").toString(),
      duration: 15,
    },
    video: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
};

export const SessionStarted: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: true,
      },
      current: {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().subtract(5, "minutes").toString(),
      duration: 15,
    },
    video: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
};

export const SessionEnded: StoryObj<Component> = {
  args: {
    members: {
      other: {
        id: 5,
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
        incall: false,
      },
      current: {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    },
    session: {
      start: dayjs().subtract(15, "minutes").toString(),
      duration: 10,
    },
    video: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    audio: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
};

export default meta;
