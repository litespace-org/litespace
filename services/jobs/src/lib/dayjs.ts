import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
// import ar from "dayjs/locale/ar";

// dayjs.locale(ar);
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(timezone);

export default dayjs;
