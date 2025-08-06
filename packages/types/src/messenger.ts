import { IUser } from "@/index";

export type Template =
  | {
      name: "hello_world";
      parameters: object;
    }
  | {
      name: "verify_phone_number";
      parameters: {
        otp: number;
      };
    }
  | {
      // A new interview has be booked at {{date}}.
      name: "new_interview_booked";
      parameters: {
        date: string;
      };
    }
  | {
      // New lesson booked! A student has booked a lesson with you for {{duration}} minutes at {{date}}.
      name: "new_lesson_booked";
      parameters: {
        duration: number;
        date: string;
      };
    }
  | {
      // Your lesson at {{predate}} is now updated to {{curdate}}.
      name: "lesson_updated";
      parameters: {
        predate: string;
        curdate: string;
      };
    }
  | {
      // Your lesson at {{date}} is canceled.
      name: "lesson_canceled";
      parameters: {
        date: string;
      };
    }
  | {
      // Your lesson will start {{time}}. Join here {{url}}
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
