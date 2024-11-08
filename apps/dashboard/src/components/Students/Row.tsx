import React from "react";

type RowProps = {
  th: string;
  td: React.ReactNode;
};

const Row: React.FC<RowProps> = ({ th, td }) => {
  return (
    <tr className="rounded-md border border-border-strong">
      <th className="border border-border-strong w-2/3">{th}</th>
      <td className="text-center">{td}</td>
    </tr>
  );
};

export default Row;
