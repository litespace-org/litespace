import DateField from "@/components/Common/DateField";
import BinaryField from "@/components/Common/BinaryField";
import GenderField from "@/components/Common/GenderField";
import React, { useMemo } from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LoadingFragment } from "@/components/Common/LoadingFragment";
import LablesTable, { TableLablesRow } from "@/components/Common/LabelsTable";
import { Typography } from "@litespace/ui/Typography";

const Content: React.FC<{
  user: IUser.Self | null;
  loading: boolean;
  error: boolean;
  refetch: Void;
}> = ({ user, loading, error, refetch }) => {
  const intl = useFormatMessage();

  const labels = useMemo((): TableLablesRow[] => {
    if (!user) return [];
    return [
      { label: intl("labels.id"), value: user.id },
      { label: intl("dashboard.user.name"), value: user.name || "-" },
      { label: intl("dashboard.user.email"), value: user.email || "-" },
      { label: intl("dashboard.user.birthYear"), value: user.birthYear || "-" },
      {
        label: intl("dashboard.user.hasPassword"),
        value: <BinaryField yes={user.password} />,
      },
      {
        label: intl("dashboard.user.gender"),
        value: <GenderField gender={user.gender} />,
      },
      {
        label: intl("global.created-at"),
        value: <DateField date={user.createdAt} />,
      },
      {
        label: intl("global.updated-at"),
        value: <DateField date={user.updatedAt} />,
      },
    ];
  }, [intl, user]);

  if (loading || error || !user)
    return (
      <LoadingFragment
        tight
        loading={loading ? { size: "large" } : undefined}
        error={error || !user ? { size: "medium" } : undefined}
        refetch={refetch}
      />
    );

  return (
    <div>
      <Typography
        tag="h4"
        className="text-subtitle-2 font-bold text-natural-950 mb-3"
      >
        {intl("dashboard.user.basic-info")}
      </Typography>
      <LablesTable rows={labels} />
    </div>
  );
};

export default Content;
