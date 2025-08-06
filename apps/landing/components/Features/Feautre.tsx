import { FeatureProps } from "@/components/Features/types";
import cn from "classnames";

const Feature: React.FC<FeatureProps> = ({
  title,
  description,
  image,
  reverse,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse md:flex-row gap-4 items-center justify-center md:justify-between h-[400px] xl:h-[600px]",
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      )}
    >
      <div className="lg:flex-1 flex flex-col gap-4 max-w-[400px] md:max-w-[377px] lg:max-w-[none] text-center md:text-left">
        <h2 className="text-subtitle-1 md:text-h4 font-bold text-natural-950 md:text-right">
          {title}
        </h2>
        <p className="text-caption md:text-subtitle-2 font-semibold text-natural-800 md:text-right">
          {description}
        </p>
      </div>

      <div className="flex-1 flex w-full h-full">{image}</div>
    </div>
  );
};

export default Feature;
