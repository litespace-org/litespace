import { ExtractObjectKeys, Paginated } from "@/utils";
import { IFilter } from "@/index";

export type Self = {
  id: number;
  name: { ar: string; en: string };
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  name_ar: string;
  name_en: string;
  created_at: Date;
  updated_at: Date;
};

export type UserTopicsRow = {
  user_id: number;
  topic_id: number;
};

export type PopulatedUserTopicRow = {
  id: number;
  name_ar: string;
  name_en: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
};

export type PopulatedUserTopic = {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: number;
};

export type CreatePayload = {
  name: { ar: string; en: string };
};

export type CreateUserTopicsPayload = {
  user: number;
  topics: number[];
};

export type CreateApiPayload = {
  arabicName: string;
  englishName: string;
};

/**
 * At least one name must be provided.
 */
export type UpdatePayload = {
  arabicName?: string;
  englishName?: string;
};

export type UpdateApiPayload = UpdatePayload;

export type AddUserTopicsApiPayload = { topicIds: number[] };
export type DeleteUserTopicsApiPayload = { topicIds: number[] };
export type ReplaceUserTopicsApiPayload = {
  addTopics: number[];
  removeTopics: number[];
};

export type FindTopicsQueryFilter = IFilter.Pagination & {
  name?: string;
  orderBy?: ExtractObjectKeys<
    Row,
    "name_ar" | "name_en" | "created_at" | "updated_at"
  >;
  orderDirection?: IFilter.OrderDirection;
};

export type CreateTopicApiResponse = Self;

export type UpdateTopicApiResponse = Self;

export type FindTopicsApiQuery = FindTopicsQueryFilter;

export type FindTopicsApiResponse = Paginated<Self>;

export type FindUserTopicsApiResponse = PopulatedUserTopic[];
