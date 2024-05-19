import { zoomConfig } from "@/constants";
import axios from "axios";
import { map, merge } from "lodash";
import {
  generateUserBasedAccessToken,
  getZoomServerApps,
  getZoomUserApp,
} from "./authorization";

const auth = Buffer.from(
  [zoomConfig.clientId, zoomConfig.clientSecret].join(":")
).toString("base64");

function constractAuthorizationHeader(token: string): {
  Authorization: `Bearer ${string}`;
} {
  return { Authorization: `Bearer ${token}` };
}

const zoomClient = axios.create({ baseURL: zoomConfig.zoomApi });

// ref: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
async function generateAccessToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "account_credentials");
  params.append("account_id", zoomConfig.accountId);

  const { data } = await axios.post<{ access_token: string }>(
    zoomConfig.tokenApi,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return data.access_token;
}

// ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
async function createZoomMeeting() {
  const token = await generateAccessToken();
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
  const { data } = await zoomClient.post(
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
      headers: merge(
        {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        constractAuthorizationHeader(token)
      ),
    }
  );

  console.log({ data });
}

async function getUserInfo() {
  const token = await generateAccessToken();

  const { data } = await zoomClient.get("/users/me", {
    headers: constractAuthorizationHeader(token),
  });

  console.log(data);
}

async function cancelZoomMeeting(id: number): Promise<void> {
  const token = await generateAccessToken();
  await zoomClient.delete(`/meetings/${id}`, {
    headers: constractAuthorizationHeader(token),
  });
}

// ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting
async function getZoomMeeting(id: number): Promise<ZoomMeeting.Self> {
  const token = await generateAccessToken();
  const { data } = await zoomClient.get<ZoomMeeting.ApiResponse>(
    `/meetings/${id}`,
    { headers: constractAuthorizationHeader(token) }
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
}

// ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetings
async function getZoomMeetings() {
  const token = await generateAccessToken();
  const { data } = await zoomClient.get<ZoomMeeting.GetMeetingsApiResponse>(
    `/users/me/meetings`,
    { headers: constractAuthorizationHeader(token) }
  );
  return data;
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

console.log(getZoomUserApp());
