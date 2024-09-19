function value(scaler: number) {
  return {
    scaler,
    /**
     * scale up the value by a factor of `value.scaler`
     */
    scale(value: number): number {
      return Math.floor(value * this.scaler);
    },
    /**
     * scale down the value by a factor of `value.scaler`
     * @returns
     */
    unscale(value: number): number {
      return value / this.scaler;
    },
  } as const;
}

export const price = value(100);
export const percentage = value(100);
