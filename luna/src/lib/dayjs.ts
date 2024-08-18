import dayjs from "dayjs";
import "dayjs/locale/ar";
import isBetween from "dayjs/plugin/isBetween";

dayjs.locale("ar");
dayjs.extend(isBetween);

export default dayjs;
