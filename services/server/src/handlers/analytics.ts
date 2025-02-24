import safeRequest from "express-async-handler";
import { IAnalytics } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import axios from "axios";

// FOR DOCS and How to use the pixel: https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api/
// FOR PARAMETERS we use: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters

const trackConversionEventPayload = zod.object({
  eventName: zod.nativeEnum(IAnalytics.EventType),
  userId: zod.string().optional(),
  fbc: zod.string().optional(),
  eventSourceUrl: zod.string().optional(),
  customData: zod.object({}).optional(),
});

// We use either production or development pixel based on the environment
const apiUrl =
  process.env.NODE_ENV !== "production"
    ? process.env.DEVELOPMENT_CONVERSION_API_URL
    : process.env.PRODUCTION_CONVERSION_API_URL;

const accessToken =
  process.env.NODE_ENV !== "production"
    ? process.env.DEVELOPMENT_CONVERSION_API_ACCESS_TOKEN
    : process.env.PRODUCTION_CONVERSION_API_URL;

async function trackFacebookEvents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!apiUrl || !accessToken) return next(res.status(200));

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
    custom_data: { ...body.customData },
    action_source: "website",
  };

  try {
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
  } catch (error) {
    console.log(error);
    res.status(200);
  }

  res.status(200);
}

export default {
  trackFacebookEvents: safeRequest(trackFacebookEvents),
};
