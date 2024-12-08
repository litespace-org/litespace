import type { Meta, StoryObj } from "@storybook/react";
import { PreCall } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser, Void } from "@litespace/types";
import { getMediaStreamFromVideo } from "@/internal/CallSimulation";
import React, { useEffect, useState } from "react";

type Component = typeof PreCall;

const meta: Meta<Component> = {
  title: "PreCall",
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

type ComponentProps = {
  stream: MediaStream | null;
  users: {
    id: number;
    gender: IUser.Gender;
    imageUrl: string | null;
    name: string | null;
    role: IUser.Role;
  }[];
  currentUser: {
    id: number;
    imageUrl: string | null;
    name: string | null;
    role: IUser.Role;
  };
  join: Void;
  toggleCamera: Void;
  camera: boolean;
  mic: boolean;
  toggleMic: Void;
  cameraError: boolean;
  micError: boolean;
};

const componentFunctions = {
  join: () => {},
  toggleCamera: () => {},
  toggleMic: () => {},
};

export const WithMedia: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 5,
        gender: IUser.Gender.Male,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        role: IUser.Role.Tutor,
      },
    ],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    camera: true,
    mic: true,
    cameraError: false,
    micError: false,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      async function getStream() {
        const stream = await getMediaStreamFromVideo();
        setStream(stream);
      }

      getStream();
    }, []);
    return <PreCall {...props} stream={stream} />;
  },
};

export const WithoutMedia: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
      },
    ],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/500",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    camera: false,
    mic: false,
    cameraError: false,
    micError: false,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    return <PreCall {...props} />;
  },
};

export const OnlyMic: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
      },
    ],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    camera: false,
    mic: true,
    cameraError: false,
    micError: false,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    return <PreCall {...props} />;
  },
};

export const OnlyCamera: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
      },
    ],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    camera: true,
    mic: false,
    cameraError: false,
    micError: false,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      async function getStream() {
        const stream = await getMediaStreamFromVideo();
        setStream(stream);
      }

      getStream();
    }, []);
    return <PreCall {...props} stream={stream} />;
  },
};

export const MicProblem: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        name: faker.person.fullName(),
        gender: IUser.Gender.Male,
        role: IUser.Role.Tutor,
      },
    ],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Student,
    },
    camera: false,
    mic: false,
    cameraError: false,
    micError: true,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    return <PreCall {...props} />;
  },
};

export const ForTutor: StoryObj<Component> = {
  args: {
    users: [
      {
        id: 5,
        imageUrl: "https://picsum.photos/400",
        gender: IUser.Gender.Male,
        name: faker.person.fullName(),
        role: IUser.Role.Student,
      },
    ],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
    },
    camera: false,
    mic: true,
    cameraError: false,
    micError: false,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    return <PreCall {...props} />;
  },
};

export const EmptyRoom: StoryObj<Component> = {
  args: {
    users: [],
    currentUser: {
      id: 5,
      imageUrl: "https://picsum.photos/400",
      name: faker.person.fullName(),
      role: IUser.Role.Tutor,
    },
    camera: true,
    mic: true,
    cameraError: false,
    micError: false,
    ...componentFunctions,
  },

  render(props: ComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      async function getStream() {
        const stream = await getMediaStreamFromVideo();
        setStream(stream);
      }

      getStream();
    }, []);
    return <PreCall {...props} stream={stream} />;
  },
};

export default meta;
