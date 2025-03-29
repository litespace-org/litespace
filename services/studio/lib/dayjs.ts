import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ar";

dayjs.locale("ar");
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(timezone);

export default dayjs;
