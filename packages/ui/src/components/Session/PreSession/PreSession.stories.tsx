import type { Meta, StoryObj } from "@storybook/react";
import { PreSession, PreSessionProps } from "@/components/Session";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import React from "react";
import { useUserMedia } from "@/internal/hooks/stream";

type Component = typeof PreSession;

const meta: Meta<Component> = {
  title: "Session/PreSession",
  component: PreSession,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="lg:tw-w-[1200px]">
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
    camera: { enabled: false, toggle: toggleCamera, error: false },
    mic: { enabled: true, toggle: toggleMic, error: false },
    join,
  },
};

export const EmptyRoom: StoryObj<Component> = {
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
    camera: {
      enabled: true,
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
    const stream = useUserMedia();
    return <PreSession {...props} stream={stream} />;
  },
};

export default meta;
