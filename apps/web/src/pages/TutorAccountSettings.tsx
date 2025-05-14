import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { useUserContext } from "@litespace/headless/context/user";
import { useSearchParams } from "react-router-dom";
import AccountSettings from "@/components/TutorSettings/AccountSettings";
import { TabId } from "@/components/TutorSettings/types";
import { isValidTab } from "@/components/TutorSettings/utils";
import { useFindTutorMeta } from "@litespace/headless/tutor";

const TutorSettings: React.FC = () => {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams();
  const { user, fetching } = useUserContext();
  const tutorQury = useFindTutorMeta(user?.id);

  const tutorMeta = tutorQury.query.data;

  const tab: TabId = useMemo(() => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "personal";
    return tab;
  }, [params]);

  if (!user || !tutorMeta) return null;

  return (
    <div className="max-w-screen-3xl mx-auto w-full h-full p-4 lg:p-6">
      <div className="w-full h-full">
        <PageTitle
          className="mb-4 lg:mb-10"
          title={intl("tutor-settings.tabs.personal-settings")}
          fetching={fetching}
        />

        <AccountSettings
          user={{ ...user, ...tutorMeta }}
          tab={tab}
          setTab={(tab) => setParams({ tab })}
        />
      </div>
    </div>
  );
};

export default TutorSettings;
