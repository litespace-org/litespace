export const asHourId = (hour: number) => `#h-${hour}`;
export const isHourId = (id: string) => Number(id.replace("#h-", "")) <= 23;
