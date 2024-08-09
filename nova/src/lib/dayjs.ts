import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relative from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";

dayjs.locale("ar");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relative);

export default dayjs;
