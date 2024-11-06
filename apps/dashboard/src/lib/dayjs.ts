import dayjs from "dayjs";
import ar from "dayjs/locale/ar";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";

dayjs.locale(ar);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

export { dayjs };
