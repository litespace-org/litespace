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
        "flex flex-col-reverse md:flex-row gap-4 justify-center md:justify-between items-center h-96",
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      )}
    >
      <div className="flex flex-col gap-4 max-w-[328px] md:max-w-[377px] lg:max-w-[600px] justify-center items-center md:items-start  text-center">
        <h2 className="text-subtitle-1 md:text-h4 font-bold text-natural-950 md:text-right">
          {title}
        </h2>
        <p className="text-caption md:text-subtitle-2 font-semibold text-natural-800 md:text-right">
          {description}
        </p>
      </div>

      {image}
    </div>
  );
};

export default Feature;
