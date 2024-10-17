import dayjs from "dayjs";
import ar from "dayjs/locale/ar";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale(ar);
dayjs.extend(relativeTime);

export { dayjs };
