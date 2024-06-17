export type Nullable<T> = T | null;

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
