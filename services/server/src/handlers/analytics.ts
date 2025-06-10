import safeRequest from "express-async-handler";
import { IAnalytics } from "@litespace/types";
import { Request, Response } from "express";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import axios from "axios";
import { conversionApiConfig } from "@/constants";

// Pixel Docs:
// https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api/
// Parameters:
// https://developers.facebook.com/docs/marketing-api/conversions-api/parameters

const trackConversionEventPayload = zod.object({
  eventName: zod.nativeEnum(IAnalytics.EventName),
  userId: zod.string().optional(),
  fbc: zod.string().optional(),
  eventSourceUrl: zod.string().optional(),
  customData: zod.object({}).optional(),
});

async function trackFacebookEvents(req: Request, res: Response) {
  const body = trackConversionEventPayload.parse(req.body);
  const ip = req.ip || req.socket.remoteAddress || "Unknown IP";

  const event: IAnalytics.ConversionEvent = {
    event_name: body.eventName,
    user_data: {
      client_user_agent: req.headers["user-agent"] || "Unknown",
      client_ip_address: ip,
      fbc: body.fbc,
    },
    event_time: dayjs.utc().unix(),
    event_source_url: body.eventSourceUrl,
    custom_data: body.customData,
    action_source: "website",
  };

  await axios.post(
    conversionApiConfig.apiUrl,
    { data: [event] },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${conversionApiConfig.token}`,
      },
    }
  );

  res.sendStatus(200);
}

export default {
  trackFacebookEvents: safeRequest(trackFacebookEvents),
};
