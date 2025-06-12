import { useFormatMessage } from "@/hooks/intl";
import { FeatureProps } from "@/components/Features/types";
import OneOnOne from "@litespace/assets/OneOnOne";
import Feature from "@/components/Features/Feautre";
import {
  Notifications,
  TimeIsYours,
  Novelity,
  AnyTime,
} from "@/components/Common/Lottie";

export const Features: React.FC = () => {
  const intl = useFormatMessage();
  const features: Array<FeatureProps> = [
    {
      title: intl("home/features/feature/one-on-one/title"),
      description: intl("home/features/feature/one-on-one/description"),
      image: (
        <OneOnOne className="w-[254px] h-[200px] md:w-[374px] md:h-[295px] lg:w-[558px] lg:h-[440px]" />
      ),
      reverse: false,
    },
    {
      title: intl("home/features/feature/anytime/title"),
      description: intl("home/features/feature/anytime/description"),
      image: <AnyTime />,
      reverse: true,
    },
    {
      title: intl("home/features/feature/novelity/title"),
      description: intl("home/features/feature/novelity/description"),
      image: <Novelity />,
      reverse: false,
    },
    {
      title: intl("home/features/feature/time-is-yours/title"),
      description: intl("home/features/feature/time-is-yours/description"),
      image: <TimeIsYours />,
      reverse: true,
    },
    {
      title: intl("home/features/feature/all-in-english/title"),
      description: intl("home/features/feature/all-in-english/description"),
      image: <Novelity />,
      reverse: false,
    },
    {
      title: intl("home/features/feature/notifications/title"),
      description: intl("home/features/feature/notifications/description"),
      image: <Notifications />,
      reverse: true,
    },
  ];

  return (
    <section className="flex flex-col md:gap-[100px] lg:gap-20 px-4 md:px-8 lg:px-[108px]">
      {features.map((feature) => (
        <Feature {...feature} />
      ))}
    </section>
  );
};
