import axios from "axios";
import { ConversionEventPayload } from "@/types/conversionEvent";

export async function trackFacebookEvents(event: ConversionEventPayload) {
  await axios.post("/api/conversion", event);
}
