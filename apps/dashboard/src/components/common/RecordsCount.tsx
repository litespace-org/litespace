import { formatNumber } from "@litespace/luna";
import React from "react";

const RecordsCount: React.FC<{ count: number }> = ({ count }) => {
  return <span>({formatNumber(count)})</span>;
};

export default RecordsCount;
