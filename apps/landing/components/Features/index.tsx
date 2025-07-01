import { useFormatMessage } from "@/hooks/intl";
import { FeatureProps } from "@/components/Features/types";
import Feature from "@/components/Features/Feautre";
import { LottieAnimate } from "@/components/Common/LottieAnimate";
import { Highlight } from "@/components/Common/Highlight";

export const Features: React.FC = () => {
  const intl = useFormatMessage();
  const features: Array<FeatureProps> = [
    {
      title: intl("home/features/feature/one-on-one/title"),
      description: (
        <Highlight id="home/features/feature/one-on-one/description" />
      ),
      image: (
        <LottieAnimate animation="oneOnOne" className="w-1/2 min-w-[350px]" />
      ),
      reverse: false,
    },
    {
      title: intl("home/features/feature/anytime/title"),
      description: <Highlight id="home/features/feature/anytime/description" />,
      image: (
        <LottieAnimate animation="anytime" className="w-1/2 min-w-[350px]" />
      ),
      reverse: true,
    },
    {
      title: intl("home/features/feature/novelity/title"),
      description: (
        <Highlight id="home/features/feature/novelity/description" />
      ),
      image: (
        <LottieAnimate animation="novelity" className="w-1/2 min-w-[350px]" />
      ),
      reverse: false,
    },
    {
      title: intl("home/features/feature/time-is-yours/title"),
      description: (
        <Highlight id="home/features/feature/time-is-yours/description" />
      ),
      image: (
        <LottieAnimate
          animation="timeIsYours"
          className="w-1/2 min-w-[350px]"
        />
      ),
      reverse: true,
    },
    {
      title: intl("home/features/feature/all-in-english/title"),
      description: (
        <Highlight id="home/features/feature/all-in-english/description" />
      ),
      image: (
        <LottieAnimate
          animation="allInEnglish"
          className="w-1/2 min-w-[350px]"
        />
      ),
      reverse: false,
    },
    {
      title: intl("home/features/feature/notifications/title"),
      description: (
        <Highlight id="home/features/feature/notifications/description" />
      ),
      image: (
        <LottieAnimate
          animation="notifications"
          className="w-1/2 min-w-[350px]"
        />
      ),
      reverse: true,
    },
  ];

  return (
    <section className="flex flex-col gap-6 py-6 sm:gap-[100px] md:gap-20 px-4 md:px-8 lg:px-[108px] bg-natural-0">
      {features.map((feature, idx) => (
        <Feature key={idx} {...feature} />
      ))}
    </section>
  );
};

export default Features;
