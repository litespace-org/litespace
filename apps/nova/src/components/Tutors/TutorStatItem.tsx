import { Typography } from "@litespace/luna/Typography";
import Star from "@litespace/assets/star";

const TutorStatItem: React.FC<{
  title: string;
  count: number | undefined;
  stars?: boolean;
}> = ({ title, count, stars }) => {
  return (
    <div>
      <Typography className="text-xs" tag="h3">
        {title}
      </Typography>
      <Typography tag="p" className="font-semibold gap-1 flex items-center">
        {count} {stars ? <Star className="scale-[70%]" /> : null}
      </Typography>
    </div>
  );
};

export default TutorStatItem;
