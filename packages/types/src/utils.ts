export type Nullable<T> = T | null;

export type NonEmptyList<T> = [T, ...T[]];

export type NumericString = `${number}`;

export type Paginated<T> = { list: T[]; total: number };

export type PagniationParams = { page?: number; size?: number };

export type StringLiteral<T> = T extends `${string & T}` ? T : never;

export type Void = () => void;

export type EmptyObject = {};

export type Element<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ExtractObjectKeys<T extends object, K extends keyof T> = Extract<
  keyof T,
  K
>;

export type Event = {
  /**
   * UTC based start time
   */
  start: string;
  /**
   * UTC based end time
   */
  end: string;
};

export type RecordAttributes = {
  createdAt: Date;
  createdById: number;
  createdByEmail: string;
  createdByName: string;
  updatedAt: Date;
  updatedById: number;
  updatedByEmail: string;
  updatedByName: string;
};

export type MappedRecordAttributes = {
  createdAt: string;
  createdBy: { id: number; email: string; name: string };
  updatedAt: string;
  updatedBy: { id: number; email: string; name: string };
};
