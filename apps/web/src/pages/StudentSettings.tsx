import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Content from "@/components/StudentSettings/Content";
import { isValidTab } from "@/components/StudentSettings/utils";
import { useUser } from "@litespace/headless/context/user";
import { StudentSettingsTabId } from "@litespace/utils/routes";

const StudentSettings: React.FC = () => {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams();
  const { user, fetching } = useUser();

  const tab: StudentSettingsTabId = useMemo(() => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "personal";
    return tab;
  }, [params]);

  if (!user) return null;

  return (
    <div className="p-4 flex flex-col gap-4 lg:gap-6 lg:p-6 max-w-screen-3xl mx-auto w-full md:max-h-max h-full">
      <PageTitle
        title={intl("student-settings.profile.title")}
        fetching={fetching}
      />

      <Content tab={tab} user={user} setTab={(tab) => setParams({ tab })} />
    </div>
  );
};

export default StudentSettings;
