import React, { useEffect, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Steps } from "@/components/TutorOnboarding/Steps";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";

type Story = StoryObj<typeof Steps>;

const meta: Meta<typeof Steps> = {
  title: "TutorOnboarding/Steps",
  component: Steps,
  decorators: [
    (Story) => (
      <div className="min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export const Primary: Story = {
  args: {
    previousInterviews: [],
    loading: false,
    tutorManager: faker.person.fullName(),
    error: false,
    activeStep: 3,
  },
};

export const PreviousInterviews: Story = {
  args: {
    previousInterviews: [
      {
        date: dayjs().toISOString(),
        tutorManager: {
          name: faker.person.fullName(),
          image: faker.image.urlPicsumPhotos(),
          id: 2,
        },
        feedback: faker.lorem.words(5),
      },
      {
        date: dayjs().toISOString(),
        tutorManager: {
          name: faker.person.fullName(),
          image: faker.image.urlPicsumPhotos(),
          id: 2,
        },
        canceledBy: "canceled-by-tutor-manager",
        feedback: null,
      },
      {
        date: dayjs().toISOString(),
        tutorManager: {
          name: faker.person.fullName(),
          image: faker.image.urlPicsumPhotos(),
          id: 2,
        },
        canceledBy: "canceled-by-you",
        feedback: null,
      },
    ],
    loading: false,
    error: false,
    tutorManager: faker.person.fullName(),
    activeStep: 3,
  },
};

export const Loading: Story = {
  args: {
    previousInterviews: [],
    loading: true,
    tutorManager: faker.person.fullName(),
    error: false,
    activeStep: 3,
  },
};

export const Error: Story = {
  args: {
    previousInterviews: [],
    tutorManager: faker.person.fullName(),
    loading: false,
    error: true,
    activeStep: 3,
  },
};

export const MoveToNextSteps: Story = {
  args: {
    loading: false,
    tutorManager: faker.person.fullName(),
    error: false,
  },
  render: (props) => {
    const [activeStep, setActiveStep] = useState<number>(1);

    useEffect(() => {
      setTimeout(() => {
        setActiveStep((prev) => prev + 1);
        setTimeout(() => {
          setActiveStep((prev) => prev + 1);
        }, 3000);
      }, 1500);
    }, []);

    return <Steps {...props} activeStep={activeStep} />;
  },
};

export default meta;
