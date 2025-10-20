import React, { lazy } from "react";

export function lazyWithRetry<T extends React.ComponentType>(
  importer: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    importer().catch((error) => {
      console.error("Chunk load failed:", error);
      return new Promise<{ default: T }>((resolve) => {
        setTimeout(() => resolve(importer()), 1000);
      });
    })
  );
}
