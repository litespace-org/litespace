export type Stats = {
  memory: number;
  cpu: number;
  elapsed: number;
  heap: {
    totalHeapSize: number;
    totalPhysicalSize: number;
    totalAvailableSize: number;
    usedHeapSize: number;
    heapSizeLimit: number;
    numberOfNativeContexts: number;
    numberOfDetachedContexts: number;
  };
  timestamp: number;
  load: number[];
};
