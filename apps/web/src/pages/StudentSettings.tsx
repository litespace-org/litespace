import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/StudentSettings/Content";
import { ITab, MobileSettings } from "@/components/StudentSettings/types";
import { isValidTab } from "@/components/StudentSettings/utils";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { StudentSettingsTabId } from "@litespace/utils/routes";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const StudentSettings: React.FC = () => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();
  const [params, setParams] = useSearchParams();
  const { user, fetching } = useUser();

  const desktopTab: StudentSettingsTabId = useMemo(() => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "personal";
    return tab;
  }, [params]);

  const mobileTab: MobileSettings = useMemo(() => {
    const tab = params.get("tab");

    if (!tab || !isValidTab(tab)) return "settings";
    return tab;
  }, [params]);

  const tab: ITab = useMemo(
    () => (md ? desktopTab : mobileTab),
    [desktopTab, md, mobileTab]
  );

  if (!user) return null;

  return (
    <div className="p-4 flex flex-col gap-6 lg:p-6 max-w-screen-3xl mx-auto w-full md:max-h-max h-full">
      {md ? (
        <PageTitle
          title={intl("student-settings.profile.title")}
          fetching={fetching}
        />
      ) : null}

      <Content tab={tab} user={user} setTab={(tab) => setParams({ tab })} />
    </div>
  );
};

export default StudentSettings;
