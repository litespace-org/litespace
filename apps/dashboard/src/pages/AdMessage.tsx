import BackLink from "@/components/Common/BackLink";
import { useUsers } from "@litespace/headless/users";
import { useSendAdMessage } from "@litespace/headless/student";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { DateInput } from "@litespace/ui/DateInput";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useOnError } from "@/hooks/error";
import { useToast } from "@litespace/ui/Toast";

const AdMessage: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();

  const [from, setFrom] = useState(
    dayjs().subtract(1, "day").format("YYYY-MM-DD")
  );
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));

  const findStudents = useUsers({
    role: IUser.Role.Student,
    createdAt: {
      gte: from,
      lte: to,
    },
    full: true,
  });

  const onError = useOnError({
    type: "mutation",
    handler: (error) => toast.error({ title: intl(error.messageId) }),
  });

  const sendAdMessageMutation = useSendAdMessage({
    onSuccess: () => toast.success({ title: intl("labels.done") }),
    onError,
  });

  const send = useCallback(() => {
    sendAdMessageMutation.mutate({
      payload: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }, [sendAdMessageMutation, from, to]);

  return (
    <div className="w-full flex flex-col gap-6 max-w-screen-2xl mx-auto p-6">
      <BackLink />

      <div className="flex flex-row gap-2 max-w-[350px] items-center">
        <Typography tag="label">{intl("placeholders.from")}</Typography>
        <DateInput value={from} onChange={setFrom} />
      </div>

      <div className="flex flex-row gap-2 max-w-[350px] items-center">
        <Typography tag="label">{intl("placeholders.to")}</Typography>
        <DateInput value={to} onChange={setTo} />
      </div>

      <div className="flex flex-col gap-1 max-h-[300px] overflow-auto">
        {findStudents.query.data?.list.map((student) =>
          student.phone ? (
            <Typography tag="span">
              {student.id} - {student.name}
            </Typography>
          ) : null
        )}
      </div>

      <div className="flex flex-row gap-2 max-w-[350px] items-center">
        <Button
          variant="primary"
          size="large"
          className="flex-1"
          onClick={send}
          loading={sendAdMessageMutation.isPending}
          disabled={sendAdMessageMutation.isPending}
        >
          {intl("labels.send")}
        </Button>
      </div>
    </div>
  );
};

export default AdMessage;
