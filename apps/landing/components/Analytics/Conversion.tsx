"use client";

import { sendFacebookEvent } from "@/lib/analytics";
import { IAnalytics } from "@litespace/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Conversion: React.FC<{ eventName?: IAnalytics.EventName }> = ({
  eventName = IAnalytics.EventName.PageView,
}) => {
  const searchParams = useSearchParams();
  const path = usePathname();

  useEffect(() => {
    const fbclid = searchParams.get("fbclid");
    if (!fbclid) return;

    sendFacebookEvent({
      page: path,
      eventName,
      fbclid,
    });
  }, [path, eventName, searchParams]);

  return null;
};

export default Conversion;
