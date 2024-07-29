export type Self = {
  page?: number;
  size?: number;
  select?: string[];
  order?: string[];
  direction?: OrderDirection[];
};

export enum OrderDirection {
  Ascending = "asc",
  Descending = "desc",
}
