import dayjs from "dayjs";
import "dayjs/locale/ar";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import relative from "dayjs/plugin/relativeTime";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.locale("ar");
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(relative);
dayjs.extend(weekOfYear);

export default dayjs;
