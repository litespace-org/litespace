import dayjs from "dayjs";
import "dayjs/locale/ar";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import relative from "dayjs/plugin/relativeTime";

dayjs.locale("ar");
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(relative);

export default dayjs;
