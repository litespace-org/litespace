import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";
import { dayjs } from "@/lib/dayjs";

const Chart = <T extends { timestamp: number }>({
  data,
  lines,
  label,
  formatter,
  dataKey,
}: {
  data: T[];
  lines: Array<keyof T>;
  label: string;
  formatter: (value: number) => string;
  dataKey?: keyof T;
}) => {
  return (
    <div className="h-[20rem] shadow-ls-x-small rounded-md p-4" dir="ltr">
      <ResponsiveContainer>
        <LineChart data={data}>
          {lines.map((key) => (
            <Line
              key={key.toString()}
              type="monotone"
              dataKey={key.toString()}
              stroke="#8884d8"
            />
          ))}
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => dayjs(tick).format("hh:mm:ss")}
            height={40}
          >
            <Label value="Timestamp" offset={-10} position="bottom" />
          </XAxis>
          <YAxis
            label={{
              value: label,
              angle: -90,
              position: "insideLeft",
              offset: 0,
            }}
            dataKey={dataKey?.toString()}
            tickFormatter={formatter}
            width={70}
          />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
