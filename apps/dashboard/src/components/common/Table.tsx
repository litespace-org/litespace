import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { Select, SelectList } from "@litespace/luna/Select";
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
          "rounded-md border border-border-strong",
          "overflow-x-auto",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <table className="min-w-full">
          {!headless ? (
            <thead className="text-xs text-foreground bg-surface-75">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 truncate text-start"
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
      {prev && goto && next && page && totalPages ? (
        <footer className="relative flex items-center justify-center gap-4 pt-4">
          <div className="absolute top-4 right-0">
            <Select
              options={options}
              value={pageSize.value}
              onChange={pageSize.set}
            />
          </div>
          <Button
            size={ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            onClick={() => goto(1)}
            disabled={page <= 1 || loading || fetching}
          >
            &laquo;
          </Button>
          <Button
            size={ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            onClick={prev}
            disabled={page <= 1 || loading || fetching}
          >
            &rarr;
          </Button>
          <Button
            size={ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            onClick={next}
            disabled={page >= totalPages || loading || fetching}
          >
            &larr;
          </Button>
          <Button
            size={ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            onClick={() => goto(totalPages)}
            disabled={page >= totalPages || loading || fetching}
          >
            &raquo;
          </Button>
        </footer>
      ) : null}
    </div>
  );
};
