import { useAtlas } from "@/atlas";
import { IAnalytics } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { MutationKey } from "@/constants";

export function useTrackFacebookEvent() {
  const atlas = useAtlas();

  const trackEvent = useCallback(
    (event: IAnalytics.ConversionEventPayload) => {
      return atlas.analytics.trackFacebookEvents(event);
    },
    [atlas]
  );

  return useMutation({
    mutationKey: [MutationKey.TrackFacebookEvent],
    mutationFn: trackEvent,
  });
}
