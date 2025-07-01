import { useFormatMessage } from "@/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { FeatureProps } from "@/components/Features/types";
import cn from "classnames";
import Link from "@/components/Common/Link";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

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
        "flex flex-col-reverse md:flex-row gap-4 justify-center md:justify-between items-center",
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

        <Link
          href={router.web({ route: Web.Root, full: true })}
          track={{
            event: "register",
            params: {
              src: "hero",
              action: "link",
            },
          }}
          className="flex justify-center lg:justify-start"
          tabIndex={-1}
        >
          <Button size="large">{intl("home/features/book-lesson-now")}</Button>
        </Link>
      </div>

      {image}
    </section>
  );
};

export default Feature;
