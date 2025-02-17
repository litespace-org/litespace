import { useDeleteTopic } from "@litespace/headless/topic";
import { Alert, AlertType } from "@litespace/ui/Alert";
import { Dialog } from "@litespace/ui/Dialog";
import { useDashFormatMessage } from "@/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { ITopic } from "@litespace/types";
import { useCallback, useMemo } from "react";

const DeleteTopic: React.FC<{
  topic: ITopic.Self;
  close: () => void;
  onUpdate: () => void;
}> = ({ topic, close, onUpdate }) => {
  const intl = useDashFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.topics.delete.success"),
    });
    onUpdate();
    close();
  }, [toast, intl, onUpdate, close]);

  const onError = useCallback(() => {
    toast.error({
      title: intl("dashboard.topics.delete.error"),
    });
  }, [toast, intl]);

  const deleteTopic = useDeleteTopic({ onSuccess, onError });

  const action = useMemo(() => {
    if (!topic) return;
    return {
      label: intl("labels.confirm"),
      onClick: () => {
        deleteTopic.mutate({ id: topic.id });
      },
      loading: deleteTopic.isPending,
      disabled: deleteTopic.isPending,
    };
  }, [topic, intl, deleteTopic]);

  return (
    <Dialog open close={close} title={intl("dashboard.topics.delete")}>
      <Alert
        type={AlertType.Error}
        title={intl("dashboard.topics.delete.alert")}
        action={action}
      />
    </Dialog>
  );
};

export default DeleteTopic;
