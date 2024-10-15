import { Button, ButtonSize, ButtonType } from "@litespace/luna";
import { Void } from "@litespace/types";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import type { TableOptions } from "@tanstack/react-table";
import cn from "classnames";

interface ReactTableProps<T extends object> {
  data: T[];
  columns: TableOptions<T>["columns"];
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
  loading: boolean;
  fetching: boolean;
}

export const Table = <T extends object>({
  data,
  columns,
  page,
  totalPages,
  loading,
  fetching,
  prev,
  goto,
  next,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div
        className={cn(
          "relative w-full",
          "rounded-md border border-border-strong",
          "overflow-x-auto",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <table className="min-w-full">
          <thead className="text-xs text-foreground bg-surface-75">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="truncate text-start px-4 py-3"
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
          <tbody className="bg-surface-200 border-b">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border-strong">
                {row.getVisibleCells().map((cell) => (
                  <td className="px-4 py-2" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-center gap-4 pt-4">
        <Button
          size={ButtonSize.Small}
          type={ButtonType.Secondary}
          onClick={() => goto(1)}
          disabled={page <= 1 || loading || fetching}
        >
          &laquo;
        </Button>
        <Button
          size={ButtonSize.Small}
          type={ButtonType.Secondary}
          onClick={prev}
          disabled={page <= 1 || loading || fetching}
        >
          &rarr;
        </Button>
        <Button
          size={ButtonSize.Small}
          type={ButtonType.Secondary}
          onClick={next}
          disabled={page >= totalPages || loading || fetching}
        >
          &larr;
        </Button>
        <Button
          size={ButtonSize.Small}
          type={ButtonType.Secondary}
          onClick={() => goto(totalPages)}
          disabled={page >= totalPages || loading || fetching}
        >
          &raquo;
        </Button>
      </footer>
    </div>
  );
};
