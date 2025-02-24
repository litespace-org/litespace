export type ConversionEventPayload = {
  eventName: EventType;
  userId?: string;
  fbc?: string;
  eventSourceUrl?: string;
  customData?: Record<string, string | number>;
};

export type ConversionEvent = {
  event_name: EventType;
  event_time: number;
  event_source_url?: string;
  custom_data?: Record<string, string | number>;
  action_source: "website";
  user_id?: string;
  user_data: {
    client_user_agent: string;
    client_ip_address?: string;
    fbc?: string;
  };
};

export enum EventType {
  PageView = "page-view",
  Register = "register",
  Login = "login",
  Depth = "depth",
  Engagement = "engagement",
}
