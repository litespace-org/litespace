import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useEffect, useMemo } from "react";
import { useUser } from "@litespace/headless/context/user";
import { useNavigate, useSearchParams } from "react-router-dom";
import Content from "@/components/TutorAccountSettings/Content";
import { TabId } from "@/components/TutorAccountSettings/types";
import { isValidTab } from "@/components/TutorAccountSettings/utils";
import { Web } from "@litespace/utils/routes";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { nullable } from "@litespace/utils";
import { useOnError } from "@/hooks/error";
import { IUser, Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";

const TutorSettings: React.FC = () => {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, fetching } = useUser();
  const { query, keys } = useFindTutorInfo(nullable(user?.id));

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  const tab: TabId = useMemo(() => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "personal";
    return tab;
  }, [params]);

  useEffect(() => {
    if (!user) return navigate(Web.Root);
  }, [navigate, user]);

  if (!user) return null;

  return (
    <div className="max-w-screen-3xl mx-auto w-full h-full p-4 lg:p-6">
      <PageTitle
        className="mb-4 lg:mb-6"
        title={intl("tutor-settings.tabs.personal-settings")}
        fetching={fetching}
      />
      <Body
        loading={query.isPending}
        error={query.isError}
        refetch={query.refetch}
        notice={query.data?.notice || 0}
        user={user}
        tab={tab}
        setTab={(tab) => setParams({ tab })}
      />
    </div>
  );
};

const Body: React.FC<{
  loading: boolean;
  user: IUser.Self;
  error: boolean;
  notice: number;
  tab: TabId;
  refetch: Void;
  setTab(tab: TabId): void;
}> = ({ loading, user, error, tab, notice, setTab, refetch }) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="mt-[10vh]">
        <Loading size="large" />
      </div>
    );

  if (error)
    return (
      <div className="mx-auto w-fit">
        <LoadingError
          error={intl("tutor-settings.profile.loading-error")}
          retry={refetch}
        />
      </div>
    );

  return <Content tab={tab} user={user} setTab={setTab} notice={notice} />;
};

export default TutorSettings;
