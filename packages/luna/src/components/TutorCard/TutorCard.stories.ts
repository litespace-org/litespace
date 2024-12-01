import type { Meta, StoryObj } from "@storybook/react";
import { TutorCard } from "@/components/TutorCard";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof TutorCard;

const meta: Meta<Component> = {
  title: "TutorCard",
  component: TutorCard,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    name: "رائد طه",
    bio: "العلوم و الفضاء, التصميم, العلاقات, العاب الفيديو +7 إضافات في السيرة الذاتية للتجربة",
    about: "مرحباً، أنا أسامة محمد، مدرس لغة إنجليزية بخبرة تزيد عن 8 سنوات. نص مطول للتجربة",
    studentsNumber: 12,
    lessonsNumber: 40,
    rating: 4.85,
    imgSrc: "https://picsum.photos/200"
  },
};

export default meta;
