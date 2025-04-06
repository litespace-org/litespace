import axios from "axios";
import { useCallback, useRef, useState } from "react";

import { Void } from "@litespace/types";
import { sum } from "lodash";
import { useApi } from "@/api";

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
  const abortController = useRef(new AbortController());
  const rates = useRef<number[]>([]);
  const api = useApi();

  const [speed, setSpeed] = useState(0.0);

  const estimate = useCallback(
    async (timeout?: number) => {
      // reset the rates array
      rates.current = [];

      // request temp photo url
      const url = await api.asset.sample();

      // start downloading a sample photo from the server
      axios.get(url, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        onDownloadProgress: (e) => {
          if (!e.rate || e.rate <= 0.0) return;
          rates.current.push(e.rate / 1024);
        },
        signal: abortController.current.signal,
      });

      // set timeout to cancel the download (GET) request and set the speed state
      setTimeout(() => {
        abortController.current.abort();
        setSpeed(
          rates.current.length ? sum(rates.current) / rates.current.length : 0.0
        );
      }, timeout || 5000);
    },
    [setSpeed, api.asset]
  );

  return { estimate, speed };
}
