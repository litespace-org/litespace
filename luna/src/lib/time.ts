/**
 * "Dayjs" index days from Sunday (0) to Saturday (6)
 *
 * In arabic, we index days from Saturday (0) to Friday (6)
 *
 * @param day Number from 0 (Sunday) to 6 (Saturday)
 * @returns Number from 0 (Saturday) to 6 (Friday)
 */
export function asArabicDayIndex(day: number) {
  return day < 6 ? day + 1 : 0;
}
