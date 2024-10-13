import { IPlan } from "@litespace/types";
import {
  flexRender,
  getCoreRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import cn from "classnames";

type TableProps<T> = {
  data: T[];
  columns: TableOptions<T>["columns"];
};

export default function Table({
  columns,
  data,
}: TableProps<IPlan.MappedAttributes>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div
      className={cn(
        "relative",
        "rounded-md border border-border-strong",
        "overflow-x-auto",
        "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
      )}
    >
      <table className="text-sm">
        <thead className="text-xs text-foreground bg-surface-75">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    scope="col"
                    className="truncate px-4 py-3 text-start"
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-background-control border-b">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border-strong">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
