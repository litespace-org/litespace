import { useDeleteTopic } from "@litespace/headless/topic";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { ITopic } from "@litespace/types";
import { useCallback } from "react";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import Trash from "@litespace/assets/Trash";

const DeleteTopic: React.FC<{
  topic: ITopic.Self;
  close: () => void;
  onUpdate: () => void;
}> = ({ topic, close, onUpdate }) => {
  const intl = useFormatMessage();
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

  return (
    <ConfirmationDialog
      open
      icon={<Trash />}
      title={intl("dashboard.topics.delete")}
      description={intl("dashboard.topics.delete.alert")}
      type="error"
      actions={{
        primary: {
          label: intl("labels.confirm"),
          onClick: () => {
            deleteTopic.mutate({ id: topic.id });
          },
          loading: deleteTopic.isPending,
          disabled: deleteTopic.isPending,
        },
        secondary: {
          label: intl("labels.cancel"),
          onClick: close,
        },
      }}
    />
  );
};

export default DeleteTopic;
