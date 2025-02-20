import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import relative from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ar";

dayjs.locale("ar");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relative);
dayjs.extend(isBetween);

export default dayjs;
