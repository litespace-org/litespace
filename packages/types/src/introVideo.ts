export type Self = {
  id: number;
  /***
   * link of the video on S3
   */
  src: string;
  tutorId: number;
  /**
   * tutor manager id who reviewed the video
   */
  reviewerId: number | null;
  state: State;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  src: string;
  tutor_id: number;
  reviewer_id: number | null;
  state: State;
  created_at: Date;
  updated_at: Date;
};

export type State = "approved" | "rejected" | "pending";

export type CreatePayloadModel = {
  src: string;
  tutorId: number;
};

export type UpdatePayloadModel = {
  state?: State;
  reviewerId?: number;
};

export type FindPayloadModel = {
  tutorIds?: number[];
  reviewerIds?: number[];
  state?: State;
  after?: string;
  before?: string;
  page?: number;
  size?: number;
  full?: boolean;
};
