import { useFormatMessage } from "@/hooks/intl";
import { FeatureProps } from "@/components/Features/types";
import OneOnOne from "@litespace/assets/OneOnOne";
import Anytime from "@litespace/assets/Anytime";
import Novelity from "@litespace/assets/Novelity";
import TimeIsYours from "@litespace/assets/TimeIsYours";
import AllInEnglish from "@litespace/assets/AllInEnglish";
import Feature from "@/components/Features/Feautre";
import { Notifications } from "@/components/Common/Lottie";

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
      image: (
        <Anytime className="w-[200px] h-[200px] md:w-[295px] md:h-[295px] lg:w-[519px] lg:h-[440px]" />
      ),
      reverse: true,
    },
    {
      title: intl("home/features/feature/novelity/title"),
      description: intl("home/features/feature/novelity/description"),
      image: (
        <Novelity className="w-[200px] h-[200px] md:w-[295px] md:h-[295px] lg:w-[440px] lg:h-[440px]" />
      ),
      reverse: false,
    },
    {
      title: intl("home/features/feature/time-is-yours/title"),
      description: intl("home/features/feature/time-is-yours/description"),
      image: (
        <TimeIsYours className="w-[198px] h-[200px] md:w-[292px] md:h-[295px] lg:w-[436px] lg:h-[440px]" />
      ),
      reverse: true,
    },
    {
      title: intl("home/features/feature/all-in-english/title"),
      description: intl("home/features/feature/all-in-english/description"),
      image: (
        <AllInEnglish className="w-[191px] h-[200px] md:w-[282px] md:h-[295px] lg:w-[420px] lg:h-[440px]" />
      ),
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
