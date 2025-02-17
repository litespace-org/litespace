import fs from "node:fs";
import { Connection, LogLineData } from "@/bot-detector/types";
import { min } from "@/bot-detector/utils";

/**
 * this class is a simple AI agent that decides whether an endpoint
 * indicates a normal, fishy, or uncertain connection.
 *
 * normal: a normal user trying to connect to the server.
 * fishy: a malicious user trying to connect to the server.
 * uncertain: cannot be determined whether it's normal or fishy.
 */
export class Analyzer {
  private threshold: number; // uncertainty threshold
  private data: Record<string, Connection>;
  private dataFilePath = "./analyzer-data.json";

  constructor() {
    this.data = {};
    this.threshold = 15;
  }

  setDataFilePath(path: string) {
    this.dataFilePath = path;
  }

  setThreshold(threshold: number) {
    this.threshold = threshold;
  }

  /**
   * assumes the file at the specified path is well formed.
   */
  load() {
    if (fs.existsSync(this.dataFilePath)) {
      const stored = fs.readFileSync(this.dataFilePath);
      this.data = JSON.parse(stored.toString());
    } else {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data));
    }
  }

  predict(data: LogLineData): Connection {
    const endpoint = `${data.type} ${data.endpoint}`;
    if (this.data[endpoint]) return this.data[endpoint];

    let closestEndpoint = "";
    let smallestWeight = Number.POSITIVE_INFINITY;
    for (const key of Object.keys(this.data)) {
      const weight = this.calculateDiffWeight(endpoint, key);
      if (weight < smallestWeight) {
        closestEndpoint = key;
        smallestWeight = weight;
      }
    }

    if (smallestWeight > this.threshold) return "uncertain";
    return this.data[closestEndpoint] || "uncertain";
  }

  /**
   * this function can represent the difference between two endpoints
   * by weight. It compares the words, of one, to the words of the other.
   *
   */
  private calculateDiffWeight(e1: string, e2: string) {
    const words1 = e1.split("/");
    const words2 = e2.split("/");

    let netWeight = 0;

    for (const w1 of words1) {
      let smallestWeight = Number.POSITIVE_INFINITY;
      for (const w2 of words2) {
        smallestWeight = min(smallestWeight, this.calWordsDiffWeight(w1, w2));
      }
      netWeight += smallestWeight;
    }

    return netWeight;
  }

  /**
   * this function can represent the differenc of two words
   * by weight value.
   *
   * Let w1 and w2 are two arbitrary words. If a letter in w1
   * doesn't exist in w2 then the weight of difference increases
   * by two. If the a letter in w1 exists in w2, but not in the
   * same position then the weight increases by one. Otherwise,
   * It increases by zero.
   */
  private calWordsDiffWeight(w1: string, w2: string): number {
    let weight = Math.abs(w1.length - w2.length);
    const len = min(w1.length, w2.length);
    for (let i = 0; i < len; i++) {
      if (w1[i] !== w2[i]) weight += 2;
      else if (w2.includes(w1[i])) weight += 1;
    }
    return weight;
  }
}
