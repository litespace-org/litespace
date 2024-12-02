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
 * Will the `full` flag is provided the pagination will be disabled and the
 * entire list of items will be included in the result.
 */
export type SkippablePagination =
  | Pagination
  | {
      /**
       * Skip the pagination and return the full result when provided.
       */
      full: true;
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
