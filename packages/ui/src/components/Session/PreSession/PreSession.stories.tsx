import type { Meta, StoryObj } from "@storybook/react";
import { PreSession, PreSessionProps } from "@/components/Session";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import React from "react";
import { useUserMedia } from "@/internal/hooks/stream";
import dayjs from "dayjs";

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
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: true,
    },
    currentMember: {
      id: 5,
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().add(5, "minutes").toString(),
      sessionEnd: dayjs().add(30, "minutes").toString(),
    },
    camera: { enabled: true, error: false, toggle: toggleCamera },
    mic: { enabled: true, error: false, toggle: toggleMic },
    join,
  },
  render(props: PreSessionProps) {
    const stream = useUserMedia();
    return <PreSession {...props} stream={stream} />;
  },
};

export const WithoutMedia: StoryObj<Component> = {
  args: {
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: true,
    },
    currentMember: {
      id: 5,
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().add(5, "minutes").toString(),
      sessionEnd: dayjs().add(30, "minutes").toString(),
    },

    camera: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
  render(props: PreSessionProps) {
    return <PreSession {...props} />;
  },
};

export const OnlyMic: StoryObj<Component> = {
  args: {
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: true,
    },
    currentMember: {
      id: 5,
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().add(5, "minutes").toString(),
      sessionEnd: dayjs().add(30, "minutes").toString(),
    },

    camera: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
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
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: true,
    },
    currentMember: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().add(5, "minutes").toString(),
      sessionEnd: dayjs().add(30, "minutes").toString(),
    },

    camera: {
      enabled: true,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
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
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: false,
    },
    currentMember: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().add(5, "minutes").toString(),
      sessionEnd: dayjs().add(30, "minutes").toString(),
    },

    camera: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
      enabled: false,
      toggle: toggleMic,
      error: true,
    },
    join,
  },
};

export const ForTutor: StoryObj<Component> = {
  args: {
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
      incall: false,
    },
    currentMember: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
    },
    sessionDetails: {
      sessionStart: dayjs().add(5, "minutes").toString(),
      sessionEnd: dayjs().add(30, "minutes").toString(),
    },

    camera: { enabled: false, toggle: toggleCamera, error: false },
    mic: { enabled: true, toggle: toggleMic, error: false },
    join,
  },
};

export const sessionStarted: StoryObj<Component> = {
  args: {
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: true,
    },
    currentMember: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().subtract(45, "minutes").toString(),
      sessionEnd: dayjs().add(5, "minutes").toString(),
    },
    camera: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
  render(props: PreSessionProps) {
    return <PreSession {...props} />;
  },
};

export const SessionEnded: StoryObj<Component> = {
  args: {
    otherMember: {
      id: 5,
      gender: IUser.Gender.Male,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
      incall: false,
    },
    currentMember: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    sessionDetails: {
      sessionStart: dayjs().subtract(45, "minutes").toString(),
      sessionEnd: dayjs().subtract(5, "minutes").toString(),
    },

    camera: {
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
    join,
  },
  render(props: PreSessionProps) {
    return <PreSession {...props} />;
  },
};

export default meta;
