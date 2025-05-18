import { Button } from "@litespace/ui/Button";
import { Select, SelectList } from "@litespace/ui/Select";
import { Void } from "@litespace/types";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import type { TableOptions } from "@tanstack/react-table";
import { useMemo } from "react";
import cn from "classnames";
import { usePageSize } from "@litespace/headless/config";
import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import ChevronDoubleRight from "@litespace/assets/ChevronDoubleRight";
import ChevronDoubleLeft from "@litespace/assets/ChevronDoubleLeft";

interface ReactTableProps<T extends object> {
  data: T[];
  columns: TableOptions<T>["columns"];
  goto?: (page: number) => void;
  next?: Void;
  prev?: Void;
  totalPages?: number;
  page?: number;
  loading?: boolean;
  fetching?: boolean;
  headless?: boolean;
  className?: string;
}

export const Table = <T extends object>({
  data,
  columns,
  page,
  totalPages,
  loading,
  fetching,
  headless = false,
  prev,
  goto,
  next,
  className,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageSize = usePageSize();

  const options = useMemo(
    (): SelectList<number> => [
      { label: "10", value: 10 },
      { label: "20", value: 20 },
      { label: "30", value: 30 },
      { label: "40", value: 40 },
      { label: "50", value: 50 },
    ],
    []
  );

  return (
    <div>
      <div
        className={cn(
          "relative w-full",
          "rounded-lg border border-natural-100",
          "overflow-x-auto",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <table className="min-w-full">
          {!headless ? (
            <thead className="text-tiny text-foreground bg-natural-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={className}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-4 truncate text-start"
                      colSpan={header.colSpan}
                      scope="col"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          ) : null}
          <tbody className="border-b bg-surface-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={className}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    className="p-4 border-l border-natural-100 last:border-0"
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {prev && goto && next && page && totalPages ? (
        <footer className="relative flex items-center justify-center gap-2 pt-4">
          <div className="absolute top-4 right-0 w-16">
            <Select
              size="small"
              options={options}
              value={pageSize.value}
              onChange={pageSize.set}
            />
          </div>
          <Button
            size="large"
            type="main"
            variant="tertiary"
            onClick={() => goto(1)}
            disabled={page <= 1 || loading || fetching}
            startIcon={<ChevronDoubleRight className="icon" />}
          />
          <Button
            size="large"
            type="main"
            variant="tertiary"
            onClick={prev}
            disabled={page <= 1 || loading || fetching}
            startIcon={<ArrowRight className="icon" />}
          />
          <Button
            size="large"
            type="main"
            variant="tertiary"
            onClick={next}
            disabled={page >= totalPages || loading || fetching}
            startIcon={<ArrowLeft className="icon" />}
          />
          <Button
            size="large"
            type="main"
            variant="tertiary"
            onClick={() => goto(totalPages)}
            disabled={page >= totalPages || loading || fetching}
            startIcon={<ChevronDoubleLeft className="icon" />}
          />
        </footer>
      ) : null}
    </div>
  );
};
