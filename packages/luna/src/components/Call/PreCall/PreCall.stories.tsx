import type { Meta, StoryObj } from "@storybook/react";
import { PreCall, PreCallProps } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import { getVideoMediaStream } from "@/internal/utils/stream";
import React, { useEffect, useState } from "react";

type Component = typeof PreCall;

const meta: Meta<Component> = {
  title: "Call/PreCall",
  component: PreCall,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "1200px",
        }}
      >
        <Story />
      </div>
    ),
    DarkStoryWrapper,
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
    camera: { enabled: true, error: false, toggle: toggleCamera },
    mic: { enabled: true, error: false, toggle: toggleMic },
    join,
  },
  render(props: PreCallProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      getVideoMediaStream().then(setStream);
    }, []);
    return <PreCall {...props} stream={stream} />;
  },
};

export const WithoutMedia: StoryObj<Component> = {
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
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
      enabled: true,
      toggle: toggleMic,
      error: false,
    },
  },
  render(props: PreCallProps) {
    return <PreCall {...props} />;
  },
};

export const OnlyMic: StoryObj<Component> = {
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
      enabled: false,
      toggle: toggleCamera,
      error: false,
    },
    mic: {
      enabled: true,
      toggle: toggleCamera,
      error: false,
    },
  },
  render(props: PreCallProps) {
    return <PreCall {...props} />;
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
  },
  render(props: PreCallProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      getVideoMediaStream().then(setStream);
    }, []);
    return <PreCall {...props} stream={stream} />;
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
  },

  render(props: PreCallProps) {
    return <PreCall {...props} />;
  },
};

export const ForTutor: StoryObj<Component> = {
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
    camera: { enabled: false, toggle: toggleCamera, error: false },
    mic: { enabled: true, toggle: toggleMic, error: false },
    join,
  },
  render(props: PreCallProps) {
    return <PreCall {...props} />;
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
  },
  render(props: PreCallProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      getVideoMediaStream().then(setStream);
    }, []);
    return <PreCall {...props} stream={stream} />;
  },
};

export default meta;
