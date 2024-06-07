import { Axios } from "axios";
import { map } from "lodash";
import {
  withAuthorization,
  withCreateAuthorization,
} from "@/integrations/zoom/authorization";
import { IZoomAccount } from "@litespace/types";

/**
 * @param start meeting start time in the local time zone for the user.
 * ref: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
 */
export async function createZoomMeeting({
  participants,
  start,
  duration,
}: {
  participants: Array<{ email: string }>;
  start: string;
  duration: number;
}): Promise<ZoomMeeting.Self> {
  return await withCreateAuthorization(
    async (
      client: Axios,
      zoomAccount: IZoomAccount.Self
    ): Promise<ZoomMeeting.Self> => {
      const { data } = await client.post<ZoomMeeting.CreateMeetingApiResponse>(
        "/users/me/meetings",
        JSON.stringify({
          agenda: "LiteSpace Private English Lesson",
          default_password: false,
          duration,
          password: "LiteSpace",
          pre_schedule: false,
          schedule_for: zoomAccount.email,
          settings: {
            allow_multiple_devices: true,
            alternative_hosts_email_notification: true,
            approval_type: 2, // No registration required
            audio: "both",
            auto_recording: "local",
            calendar_type: 1, //  Zoom Outlook add-in
            meeting_invitees: participants,
            close_registration: false,
            email_notification: true,
            encryption_type: "enhanced_encryption",
            focus_mode: true,
            host_video: true,
            jbh_time: 0, // Allow the participant to join the meeting at anytime.
            join_before_host: true,
            meeting_authentication: false,
            mute_upon_entry: false,
            participant_video: true,
            private_meeting: false,
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
            auto_start_meeting_summary: false,
            auto_start_ai_companion_questions: false,
          },
          start_time: start,
          timezone: "Africa/Cairo",
          topic: "Private English Lesson",
          type: 2,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      return {
        id: data.id,
        host: { email: data.host_email, id: data.host_id },
        systemZoomAccountId: zoomAccount.id,
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
  );
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
    const { data } = await client.get<ZoomMeeting.GetMeeingApiResponse>(
      `/meetings/${id}`
    );

    return {
      id: data.id,
      host: { email: data.host_email, id: data.host_id },
      systemZoomAccountId: 0,
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
    const { data } =
      await client.get<ZoomMeeting.GetMeetingsApiResponse>(
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

  export type CreateMeetingApiResponse = Omit<GetMeeingApiResponse, "uuid">;

  export type GetMeeingApiResponse = {
    assistant_id: string;
    host_email: string;
    host_id: string;
    id: number;
    uuid: string;
    agenda: string;
    created_at: string;
    duration: number;
    encrypted_password: string;
    password: string;
    pstn_password: string;
    h323_password: string;
    join_url: string;
    chat_join_url: string;
    occurrences: {
      duration: number;
      occurrence_id: string;
      start_time: string;
      status: "available" | "deleted";
    };
    pmi: string;
    pre_schedule: boolean;
    start_time: string;
    timezone: string;
    settings: { meeting_invitees: Array<{ email: string }> };
    status: Status;
  };

  export type Self = {
    id: number;
    systemZoomAccountId: number;
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
