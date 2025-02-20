import { NextResponse } from "next/server";
import zod from "zod";
import { ConversionEvent, EventType } from "@/types/conversionEvent";
import dayjs from "@/lib/dayjs";
import axios from "axios";

const trackConversionEventPayload = zod.object({
  eventName: zod.nativeEnum(EventType),
  userId: zod.string().optional(),
  eventSourceUrl: zod.string().optional(),
  customData: zod.object({}).optional(),
});

const apiUrl = process.env.CONVERSION_API_URL;
const accessToken = process.env.CONVERSION_API_ACCESS_TOKEN;

export async function POST(req: Request) {
  // disable the route in dev and staging environments
  if (process.env.NODE_ENV !== "production")
    return NextResponse.json({ success: true }, { status: 200 });

  const body = trackConversionEventPayload.parse(await req.json());
  const xForwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0];
  const realIp = req.headers.get("x-real-ip"); // will be set from nginx
  const ip = xForwardedFor || realIp || "Unknown IP";

  const event: ConversionEvent = {
    event_name: body.eventName,
    user_data: {
      client_user_agent: req.headers.get("user-agent") || "Unknown",
      client_ip_address: ip,
    },
    event_time: dayjs.utc().unix(),
    event_source_url: body.eventSourceUrl,
    custom_data: { ...body.customData },
    action_source: "website",
  };

  if (!apiUrl || !accessToken)
    return console.error("Missing Conversion API configuration");

  await axios.post(
    apiUrl,
    { data: [event] },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return NextResponse.json({ success: true }, { status: 200 });
}
