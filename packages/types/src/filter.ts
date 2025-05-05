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

export type Pagination = { page?: number; size?: number };

/**
 * When the `full` flag is provided the pagination will be disabled and the
 * entire list of items will be included in the result.
 */
export type SkippablePagination = Pagination & {
  /**
   * Skip the pagination and return the full result when provided.
   */
  full?: boolean;
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

export type Numeric =
  | number
  | {
      gte?: number;
      lte?: number;
      gt?: number;
      lt?: number;
      noeq?: number;
    };

export type Date =
  | string
  | {
      gte?: string;
      lte?: string;
      gt?: string;
      lt?: string;
      noeq?: string;
    };
