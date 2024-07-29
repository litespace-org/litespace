export type Self = {
  page?: number;
  size?: number;
  search?: string;
  match?: Match;
  /**
   * Mark search as case-sensitive or case-insensitive
   */
  sensitive?: boolean;
  columns?: string[];
  order?: string[];
  direction?: OrderDirection[];
};

export enum Match {
  Exact = "exact",
  Suffix = "suffix",
  Prefix = "prefix",
  Loose = "loose",
}

export enum OrderDirection {
  Ascending = "asc",
  Descending = "desc",
}
