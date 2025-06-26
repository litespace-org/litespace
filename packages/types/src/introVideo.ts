import { Paginated } from "@/utils";
import { IFilter } from "@/index";

export enum AssetFileName {
  Video = "video",
}

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

export type Column = keyof Row;

export type Row = {
  id: number;
  src: string;
  tutor_id: number;
  reviewer_id: number | null;
  state: State;
  created_at: Date;
  updated_at: Date;
};

export type Field = keyof Self;

export enum State {
  Pending = 1,
  Rejected = 2,
  Approved = 3,
}

export type CreateModelPayload = {
  src: string;
  tutorId: number;
  reviewerId: number;
};

export type UpdateModelPayload = {
  id: number;
  state?: State;
  reviewerId?: number;
};

export type UpdateApiPayload = {
  state?: State;
  reviewerId?: number;
};

export type FindModelPayload = IFilter.SkippablePagination & {
  tutorIds?: number[];
  videoIds?: number[];
  reviewerIds?: number[];
  createdAt?: IFilter.Date;
  state?: State;
};

export type FindModelResponse = Paginated<Self>;

export type CreateApiPayload = {
  /**
   * video duration in minutes
   */
  duration: number;
};

export type CreateApiFiles = {
  video?: Blob;
};

export type FindApiPayload = IFilter.SkippablePagination & {
  tutorIds?: number[];
  reviewerIds?: number[];
  approved?: boolean;
  createdAt?: IFilter.Date;
};

export type FindApiResponse = {
  /**
   * The main paginated response object that the requester, especially
   * admins and regular-tutors, seeks to retrieve.
   */
  main: Paginated<Self>;
  /**
   * The reviewers paginated response object that the tutor-managers may
   * want to retrieve besides the main response.
   * This shall be always undefined for admins and regular-tutors.
   */
  forReviewers?: Paginated<Self>;
};
