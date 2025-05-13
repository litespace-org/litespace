import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Conent from "@/components/StudentSettings/V2/Conent";
import { TabId } from "@/components/StudentSettings/V2/types";
import { isValidTab } from "@/components/StudentSettings/V2/utils";
import { useUserContext } from "@litespace/headless/context/user";

export default function StudentSettingsV2() {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams();
  const { user, fetching } = useUserContext();

  const tab: TabId = useMemo(() => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "personal";
    return tab;
  }, [params]);

  if (!user) return null;

  return (
    <div className="p-4 lg:p-6 max-w-screen-3xl mx-auto w-full md:max-h-max h-[calc(100vh-100px)]">
      <PageTitle
        title={intl("student-settings.profile.title")}
        className="mb-4 lg:mb-6"
        fetching={fetching}
      />

      <Conent tab={tab} user={user} setTab={(tab) => setParams({ tab })} />
    </div>
  );
}
