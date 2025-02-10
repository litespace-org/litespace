import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ar";

dayjs.locale("ar");
dayjs.extend(utc);

export default dayjs;
