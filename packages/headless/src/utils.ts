import axios, { CanceledError } from "axios";
import { useCallback, useRef, useState } from "react";

import { Void } from "@litespace/types";
import { isEmpty, mean } from "lodash";
import { useApi } from "@/api";
import { safePromise } from "@litespace/utils";
import { useLogger } from "@/logger";

/**
 * this hook can be used to estimate users internet speed; it supplies react components
 * with two variables: the first (speed) is a number that indicates the estimated speed
 * value in kb/s, while the second (estimate) is a function that can be used to start
 * the estimating process.
 */
export function useInternetSpeed(): {
  estimate: Void;
  speed: number;
} {
  const logger = useLogger();
  const abortController = useRef(new AbortController());
  const rates = useRef<number[]>([]);
  const api = useApi();

  const [speed, setSpeed] = useState(0.0);

  const estimate = useCallback(
    async (timeout: number = 8_000) => {
      // reset the rates array
      rates.current = [];

      // request temp photo url
      const url = await safePromise(api.asset.sample());
      if (url instanceof Error) return logger.error(url);

      // start downloading a sample photo from the server
      axios
        .get(url, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          onDownloadProgress: (e) => {
            if (!e.rate || e.rate <= 0) return;
            rates.current.push(e.rate / 1024);
          },
          signal: abortController.current.signal,
        })
        .catch((error) => {
          if (error instanceof CanceledError) return;
          logger.error("Estimate download speed: ", error);
        });

      // set timeout to cancel the download (GET) request and set the speed state
      setTimeout(() => {
        abortController.current.abort("end");
        const spead = !isEmpty(rates.current) ? mean(rates.current) : 0;
        logger.info(`Internet spead: ${spead.toFixed(2)} kb/s`);
        setSpeed(spead);
      }, timeout);
    },
    [api.asset, logger]
  );

  return { estimate, speed };
}
