import { Paginated, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";

export type UsePaginateResult<T> = {
  query: UseQueryResult<Paginated<T>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
};
