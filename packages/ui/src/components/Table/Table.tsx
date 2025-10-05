import { Button } from "@litespace/ui/Button";
import { Select, SelectList } from "@litespace/ui/Select";
import { Void } from "@litespace/types";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { Header, TableOptions } from "@tanstack/react-table";
import { useCallback } from "react";
import cn from "classnames";
import { usePageSize } from "@litespace/headless/config";
import ChevronRight from "@litespace/assets/ChevronRight";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import ChevronDoubleRight from "@litespace/assets/ChevronDoubleRight";
import ChevronDoubleLeft from "@litespace/assets/ChevronDoubleLeft";

export type TableNaviationProps = {
  goto?: (page: number) => void;
  next?: Void;
  prev?: Void;
  loading?: boolean;
  fetching?: boolean;
  page?: number;
  totalPages?: number;
};

type Horizontal = "start" | "center" | "end";
type Vertical = "top" | "middle" | "bottom";

type TextAlign =
  | Exclude<`${Vertical}-${Horizontal}`, "center-middle">
  | "center";

type TableProps<T extends object> = TableNaviationProps & {
  data: T[];
  columns: TableOptions<T>["columns"];
  headless?: boolean;
  textAlign?: TextAlign;
};

const options: SelectList<number> = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
  { label: "40", value: 40 },
  { label: "50", value: 50 },
];

export const Table = <T extends object>({
  data,
  textAlign = "top-center",
  columns,
  page,
  totalPages,
  loading,
  fetching,
  headless = false,
  prev,
  goto,
  next,
}: TableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageSize = usePageSize();

  const sort = useCallback(
    (header: Header<T, unknown>) => {
      if (!header.column.getCanSort())
        return console.error("cannot sort by", header.column.id);
      console.log("sorting by", header.column.id);

      table.setSorting((prev) => [
        {
          id: header.column.id,
          desc: prev[0]?.id === header.column.id ? !prev[0]?.desc : true,
        },
      ]);
    },
    [table]
  );

  return (
    <div>
      <div
        className={cn(
          "relative w-full",
          "rounded-lg border border-natural-100",
          "overflow-x-auto whitespace-nowrap",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        )}
      >
        <table className="min-w-full">
          {!headless ? (
            <thead className="text-tiny text-foreground bg-natural-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-4 truncate text-start"
                      colSpan={header.colSpan}
                      scope="col"
                      onClick={() => sort(header)}
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
            {table.getSortedRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    className={cn(
                      "p-4 border-l border-natural-100 last:border-0",
                      {
                        "align-top text-start": textAlign === "top-start",
                        "align-top text-center": textAlign === "top-center",
                        "align-top text-end": textAlign === "top-end",
                        "align-middle text-start": textAlign === "middle-start",
                        "align-middle text-center": textAlign === "center",
                        "align-middle text-end": textAlign === "middle-end",
                        "align-bottom text-start": textAlign === "bottom-start",
                        "align-bottom text-center":
                          textAlign === "bottom-center",
                        "align-bottom text-end": textAlign === "bottom-end",
                      }
                    )}
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
              size="large"
              options={options}
              value={pageSize.value}
              onChange={pageSize.set}
            />
          </div>
          <Button
            size="large"
            type="natural"
            variant="secondary"
            onClick={() => goto(1)}
            disabled={page <= 1 || loading || fetching}
            startIcon={<ChevronDoubleRight className="icon" />}
          />
          <Button
            size="large"
            type="natural"
            variant="primary"
            onClick={prev}
            disabled={page <= 1 || loading || fetching}
            startIcon={<ChevronRight className="icon w-4 h-4" />}
          />
          <Button
            size="large"
            type="natural"
            variant="primary"
            onClick={next}
            disabled={page >= totalPages || loading || fetching}
            startIcon={<ChevronLeft className="icon w-4 h-4" />}
          />
          <Button
            size="large"
            type="natural"
            variant="secondary"
            onClick={() => goto(totalPages)}
            disabled={page >= totalPages || loading || fetching}
            startIcon={<ChevronDoubleLeft className="icon" />}
          />
        </footer>
      ) : null}
    </div>
  );
};
