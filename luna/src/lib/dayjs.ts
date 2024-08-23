import dayjs from "dayjs";
import "dayjs/locale/ar";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";

dayjs.locale("ar");
dayjs.extend(isBetween);
dayjs.extend(utc);

export default dayjs;
