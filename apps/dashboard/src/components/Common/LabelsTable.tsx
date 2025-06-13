import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Table } from "@litespace/ui/Table";

export type TableLablesRow = {
  label: React.ReactNode;
  value: React.ReactNode;
};

const LabelsTable: React.FC<{ rows: TableLablesRow[] }> = ({ rows }) => {
  const columnHelper = createColumnHelper<TableLablesRow>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "lable",
        cell: (info) => info.row.original.label,
      }),
      columnHelper.display({
        id: "value",
        cell: (info) => info.row.original.value,
      }),
    ],
    [columnHelper]
  );

  return <Table columns={columns} data={rows} headless />;
};

export default LabelsTable;
