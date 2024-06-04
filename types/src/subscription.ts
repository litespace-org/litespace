export enum Period {
  Month = "month",
  Quarter = "quarter",
  Year = "year",
}

export type Self = {
  id: number;
  studentId: number;
  monthlyMinutes: number;
  remainingMinutes: number;
  autoRenewal: boolean;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  student_id: number;
  monthly_minutes: number;
  remaining_minutes: number;
  auto_renewal: boolean;
  start: Date;
  end: Date;
  created_at: Date;
  updated_at: Date;
};
