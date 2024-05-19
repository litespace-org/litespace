import { zoomConfig } from "@/constants";
import axios, { Axios } from "axios";
import { map, merge } from "lodash";
import {
  generateServerBasedAccessToken,
  generateUserBasedAccessToken,
  getZoomServerApps,
  getZoomUserApp,
  refershAccessToken,
  withAuthorization,
} from "@/meetings/zoom/authorization";

function constractAuthorizationHeader(token: string): {
  Authorization: `Bearer ${string}`;
} {
  return { Authorization: `Bearer ${token}` };
}

// ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
async function createZoomMeeting() {
  /**
   * Requirements:
   * 1. Title should be the concatenation to the platform name, the user, and
   *    the tutuor. or `LiteSpace Private One-To-One Lesson`
   * 2. Check the ability to increase the limit or create a meeting on the
   *    tutors behalf.
   * 3. Correct meeting timing and correct timezone.
   * 4. Validate if the video will be recoreded or not.
   * 5. Getting recoreded videos.
   * 6. Getting meetings.
   * 7. Getting meeting by id.
   * 8. Save the meeting to the `meetings` table with its id from zoom.
   * 9. Find a way to increase the rate limit.
   *    - try to release the app.
   *    - download it in another account.
   *    - create the meeting on his behalf.
   */
  return await withAuthorization(async (client: Axios) => {
    const { data } = await client.post(
      "/users/ib153507@gmail.com/meetings",
      JSON.stringify({
        agenda: "My Meeting 3",
        default_password: false,
        duration: 30,
        password: "LiteSpace",
        pre_schedule: false,
        // recurrence: {
        //   end_date_time: "2022-04-02T15:59:00Z",
        //   end_times: 7,
        //   monthly_day: 1,
        //   monthly_week: 1,
        //   monthly_week_day: 1,
        //   repeat_interval: 1,
        //   type: 1,
        //   weekly_days: "1",
        // },
        // schedule_for: "ahmedibarhim556@gmail.com",
        schedule_for: "ib153407@gmail.com",
        settings: {
          //   additional_data_center_regions: ["TY"],
          allow_multiple_devices: true,
          //   alternative_hosts: "jchill@example.com;thill@example.com",
          alternative_hosts_email_notification: true,
          approval_type: 2, // No registration required
          //   approved_or_denied_countries_or_regions: {
          //     approved_list: ["CX"],
          //     denied_list: ["CA"],
          //     enable: true,
          //     method: "approve",
          //   },
          audio: "both",
          //   audio_conference_info: "test",
          //   authentication_domains: "example.com",
          // authentication_exception: [
          //   {
          //     email: "ahmeibrahim556@gmail.com",
          //     name: "Ahmed Ibrahim - Old",
          //   },
          //   {
          //     email: "me@ahmedibrahim.dev",
          //     name: "Ahmed Ibrahim - New",
          //   },
          // ],
          //   authentication_option: "signIn_D8cJuqWVQ623CI4Q8yQK0Q",
          auto_recording: "cloud",
          //   breakout_room: {
          //     enable: true,
          //     rooms: [
          //       {
          //         name: "room1",
          //         participants: ["jchill@example.com"],
          //       },
          //     ],
          //   },
          calendar_type: 1, //  Zoom Outlook add-in
          close_registration: false,
          //   contact_email: "jchill@example.com",
          //   contact_name: "Jill Chill",
          email_notification: false,
          encryption_type: "enhanced_encryption",
          focus_mode: true,
          //   global_dial_in_countries: ["US"],
          host_video: true,
          jbh_time: 0, // Allow the participant to join the meeting at anytime.
          join_before_host: true,
          //   language_interpretation: {
          //     enable: true,
          //     interpreters: [
          //       {
          //         email: "interpreter@example.com",
          //         languages: "US,FR",
          //       },
          //     ],
          //   },
          //   sign_language_interpretation: {
          //     enable: true,
          //     interpreters: [
          //       {
          //         email: "interpreter@example.com",
          //         sign_language: "American",
          //       },
          //     ],
          //   },
          meeting_authentication: false,
          meeting_invitees: [
            { email: "ahmedibarhim556@gmail.com" },
            { email: "me@ahmedibrahim.dev" },
            { email: "ib153507@gmail.com" },
          ],
          mute_upon_entry: false,
          participant_video: true,
          private_meeting: false,
          //   registrants_confirmation_email: true,
          //   registrants_email_notification: true,
          registration_type: 1,
          show_share_button: true,
          use_pmi: false,
          waiting_room: false,
          watermark: false,
          host_save_video_order: true,
          alternative_host_update_polls: true,
          internal_meeting: false,
          continuous_meeting_chat: {
            enable: true,
            auto_add_invited_external_users: true,
          },
          participant_focused_meeting: false,
          push_change_to_calendar: false,
          //   resources: [
          //     {
          //       resource_type: "whiteboard",
          //       resource_id: "X4Hy02w3QUOdskKofgb9Jg",
          //       permission_level: "editor",
          //     },
          //   ],
          auto_start_meeting_summary: false,
          auto_start_ai_companion_questions: false,
        },
        start_time: "2024-05-18T03:30:00Z",
        // template_id: "Dv4YdINdTk+Z5RToadh5ug==",
        timezone: "Africa/Cairo",
        topic: "My Meeting",
        // tracking_fields: [
        //   {
        //     field: "field1",
        //     value: "value1",
        //   },
        // ],
        type: 2,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log({ data });
  });
}

async function getUserInfo() {
  return withAuthorization(async (client: Axios) => {
    const { data } = await client.get("/users/me");
    return data;
  });
}

async function cancelZoomMeeting(id: number): Promise<void> {
  return await withAuthorization(
    async (client) => await client.delete(`/meetings/${id}`)
  );
}

// ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting
async function getZoomMeeting(id: number): Promise<ZoomMeeting.Self> {
  return await withAuthorization(async (client) => {
    const { data } = await client.get<ZoomMeeting.ApiResponse>(
      `/meetings/${id}`
    );

    return {
      id: data.id,
      host: { email: data.host_email, id: data.host_id },
      invitees: map(data.settings.meeting_invitees, "email"),
      status: data.status,
      agenda: data.agenda,
      createdAt: data.created_at,
      startTime: data.start_time,
      timezone: data.timezone,
      joinUrl: data.join_url,
      passwords: {
        password: data.password,
        encrypted: data.encrypted_password,
        pstn: data.pstn_password,
        h323: data.h323_password,
      },
    };
  });
}

// ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetings
async function getZoomMeetings(): Promise<ZoomMeeting.GetMeetingsApiResponse> {
  return await withAuthorization(async (client: Axios) => {
    const { data } = await client.get<ZoomMeeting.GetMeetingsApiResponse>(
      `/users/me/meetings`
    );
    return data;
  });
}

export namespace ZoomMeeting {
  export enum Status {
    Waiting = "waiting",
    Started = "started",
  }

  export type ApiResponse = {
    assistant_id: string;
    host_email: string;
    host_id: string;
    id: number;
    uuid: string;
    agenda: string;
    created_at: string;
    duration: number;
    encrypted_password: string;
    pstn_password: string;
    h323_password: string;
    join_url: string;
    chat_join_url: string;
    occurrences: {
      duration: number;
      occurrence_id: string;
      start_time: string;
      status: "available" | "deleted ";
    };
    password: string;
    pmi: string;
    pre_schedule: boolean;
    start_time: string;
    timezone: string;
    settings: { meeting_invitees: Array<{ email: string }> };
    status: Status;
  };

  export type Self = {
    id: number;
    host: { email: string; id: string };
    invitees: string[];
    status: Status;
    agenda: string;
    createdAt: string;
    startTime: string;
    timezone: string;
    joinUrl: string;
    passwords: {
      password: string;
      encrypted: string;
      pstn: string;
      h323: string;
    };
  };

  export type GetMeetingsApiResponse = {
    next_page_token?: string;
    page_count: number;
    page_number: number;
    page_size: number;
    total_records: number;
    meetings: Array<{
      agenda: string;
      created_at: string;
      duration: string;
      host_id: string;
      id: string;
      uuid: string;
      join_url: string;
      pmi: string;
      start_time: string;
      timezone: string;
      topic: string;
      type: number;
    }>;
  };
}

// createZoomMeeting();
// getUserInfo();
// getZoomMeeting(821_5372_0503).then(console.log);
// getZoomMeeting(835_5246_4754).then(console.log);
// getZoomMeetings().then(console.log);

// generateUserBasedAccessToken("");

// console.log(getZoomUserApp());
// generateUserBasedAccessToken(
//   "6hKu2rzG5cIhY8_Vlq4TqGZLcJ6zsJyrw",
//   getZoomUserApp()
// ).then(console.log);

// const app = getZoomServerApps()[0];
// generateServerBasedAccessToken(app).then(console.log);

refershAccessToken(
  getZoomUserApp(),
  "eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjZlZTczMzIwLWJkZDMtNDY2MC1hZTQ2LWQ2ZDBiNjc3NzQ3ZSJ9.eyJ2ZXIiOjksImF1aWQiOiIzZGRiYWZlYzlhNmExZDhlZWYyZDk3ODdkNDQ4NjQ2YiIsImNvZGUiOiI2aEt1MnJ6RzVjSWhZOF9WbHE0VHFHWkxjSjZ6c0p5cnciLCJpc3MiOiJ6bTpjaWQ6cnVCVlVBM3hRNkNqMmpQYWFvQU5BIiwiZ25vIjowLCJ0eXBlIjoxLCJ0aWQiOjAsImF1ZCI6Imh0dHBzOi8vb2F1dGguem9vbS51cyIsInVpZCI6InJndm1MUllCUXMtWXRRdDFUMTN4YnciLCJuYmYiOjE3MTYwOTU0NzAsImV4cCI6MTcyMzg3MTQ3MCwiaWF0IjoxNzE2MDk1NDcwLCJhaWQiOiJGSEgzNExTelNlYUMtWkV4bEhpTl9BIn0.NPZSsHv01Wr7hv-ZoD_y1V-vWS-DnsNW5BT9U3nrsXrgdQHt0p6JdzO-RlSIoXYxe-qab3xk7FIo51YrNn3OjQ"
).then(console.log);
