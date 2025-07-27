import { IUser } from "@/index";

export type Template =
  | {
      name: "verify_phone_number";
      parameters: {
        otp: number;
      };
    }
  | {
      // A new interview has be booked at ${date}
      name: "new_interview_booked";
      parameters: {
        date: string;
      };
    }
  | {
      // New lesson booked! A student has booked a lesson with you for ${payload.duration} minutes at ${date} (GMT+2)
      name: "new_lesson_booked";
      parameters: {
        duration: number;
        date: string;
      };
    }
  | {
      // Your lesson at ${prevStart} is now updated to ${currentStart}
      name: "lesson_updated";
      parameters: {
        preDate: string;
        curDate: string;
      };
    }
  | {
      // Your lesson at ${date} is canceled.
      name: "lesson_canceled";
      parameters: {
        date: string;
      };
    }
  | {
      // Your lesson will start ${tz.fromNow()}. Join here ${url}
      name: "lesson_reminder";
      parameters: {
        time: string;
        url: string;
      };
    };

export type Message = {
  to: string;
  template: Template;
  method?: IUser.NotificationMethod | null;
};
