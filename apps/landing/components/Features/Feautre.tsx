import { useFormatMessage } from "@/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { FeatureProps } from "@/components/Features/types";
import cn from "classnames";

const Feature: React.FC<FeatureProps> = ({
  title,
  description,
  image,
  reverse,
}) => {
  const intl = useFormatMessage();

  return (
    <section
      className={cn(
        "flex flex-col-reverse md:flex-row justify-center md:justify-between items-center",
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      )}
    >
      <div className="flex flex-col gap-4 max-w-[328px] md:max-w-[377px] lg:max-w-[600px] justify-center">
        <h2 className="text-h4 font-bold text-natural-950">{title}</h2>
        <p className="text-subtitle-2 font-semibold text-natural-800">
          {description}
        </p>
        <Button size="large">{intl("home/features/book-lesson-now")}</Button>
      </div>
      <div className="flex-shrink-0">{image}</div>
    </section>
  );
};

export default Feature;
