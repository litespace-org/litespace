import autocannon from "autocannon";
import { Backend } from "@litespace/types";
import { backends } from "@litespace/atlas";
import { Command, Option } from "commander";
import { table } from "table";
import ms from "ms";
import bytes from "pretty-bytes";

function report(data: (string | number)[][], title: string) {
  console.log(
    table(data, {
      columnDefault: {
        width: 10,
      },
      header: {
        alignment: "center",
        content: title,
      },
    })
  );
}

const benchmarkApi = new Command()
  .name("api")
  .addOption(
    new Option("-b, --backend <ENV>", "Backend to run tests against")
      .choices([Backend.Local, Backend.Staging, Backend.Production])
      .makeOptionMandatory()
  )
  .option<number>(
    "-c, --connections <VALUE>",
    "Number of concurrent requests",
    (value: string) => {
      const number = Number(value);
      if (Number.isNaN(number)) throw new Error("Invalid number");
      return number;
    },
    10
  )
  .option(
    "-d, --duration <VALUE>",
    "Duration in seconds or as a time string",
    "10"
  )
  .option(
    "-r, --route <VALUE>",
    "API Route to run the benchmark against",
    "/api/v1/user/tutor/list/onboarded"
  )
  .action(
    async ({
      backend,
      duration,
      connections,
      route,
    }: {
      backend: Backend;
      duration: string;
      connections: number;
      route: string;
    }) => {
      const url = backends.main[backend].concat(route);
      const result = await autocannon({
        url,
        duration,
        connections,
      });
      const latency = result.latency;
      const requests = result.requests;
      const throughput = result.throughput;

      report(
        [
          ["Stat", "2.5%", "50%", "97.5%", "99%", "Avg", "Stdev", "Max"],
          [
            "Latency",
            ms(latency.p2_5),
            ms(latency.p50),
            ms(latency.p97_5),
            ms(latency.p99),
            ms(latency.average),
            ms(latency.stddev),
            ms(latency.max),
          ],
        ],
        "Latency Analysis"
      );

      report(
        [
          ["Stat", "1%", "2.5%", "50%", "97.5%", "Avg", "Stdev", "Min"],
          [
            "Req/Sec",
            requests.p1,
            requests.p2_5,
            requests.p50,
            requests.p97_5,
            requests.average,
            requests.stddev,
            requests.min,
          ],
          [
            "Bytes/Sec",
            bytes(throughput.p1),
            bytes(throughput.p2_5),
            bytes(throughput.p50),
            bytes(throughput.p97_5),
            bytes(throughput.average),
            bytes(throughput.stddev),
            bytes(throughput.min),
          ],
        ],
        "Requests/Throughput"
      );
    }
  );

new Command()
  .name("benchmark")
  .description("Benchmark LiteSpace backend server API")
  .version("1.0.0")
  .addCommand(benchmarkApi)
  .parse();
