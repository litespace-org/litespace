import { ILesson, IPlan, ITutor, Void } from "@litespace/types";

export type TxTypePayload =
  | {
      type: "paid-lesson";
      tutorId: number;
      slotId: number;
      start: string;
      duration: ILesson.Duration;
    }
  | {
      type: "paid-plan";
      planId: number;
      period: IPlan.PeriodLiteral;
    };

export type TxTypeData =
  | {
      type: "paid-lesson";
      data: {
        tutor?: ITutor.FindTutorInfoApiResponse;
        slotId: number;
        start: string;
        duration: ILesson.Duration;
      };
    }
  | {
      type: "paid-plan";
      data: { plan?: IPlan.Self; period: IPlan.PeriodLiteral };
    };

export type TxTypeDataQuery = TxTypeData & {
  loading: boolean;
  fetching: boolean;
  error: boolean;
  refetch: Void;
};
