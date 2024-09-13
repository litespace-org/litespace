import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relative from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ar";

dayjs.locale("ar");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relative);
dayjs.extend(isBetween);

export default dayjs;
