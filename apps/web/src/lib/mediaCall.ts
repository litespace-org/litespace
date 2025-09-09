import { CallManager } from "@/modules/MediaCall/CallManager";
import { CallMember } from "@/modules/MediaCall/CallMember";
import { EventsExtensions } from "@/modules/MediaCall/CallSession";
import { LivekitCallSession } from "@/lib/livekit";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";
import { WebDeviceManager } from "@/lib/device";

/**
 * assumes the first index of the array is the current member.
 */
export function makeCall(
  memberIds: Array<CallMember["id"]>,
  ext: Partial<EventsExtensions>,
  eh?: ErrorHandler
): CallManager {
  return new CallManager(
    new LivekitCallSession(memberIds, ext, eh),
    new WebDeviceManager(eh),
    eh || new ErrorHandler()
  );
}
