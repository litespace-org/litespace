import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import { Dialog } from "@/components/Dialog";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { concat, uniq } from "lodash";
import { MAX_TOPICS_COUNT } from "@litespace/utils";
import { Animate } from "@/components/Animate";
import { AnimatePresence } from "framer-motion";

type Props = {
  topics: Array<{
    id: number;
    label: string;
  }>;
  close: Void;
  retry: Void;
  confirm: (topicIds: number[]) => void;
  opened: boolean;
  initialTopics?: number[];
  confirming?: boolean;
  loading?: boolean;
  error?: boolean;
};

export const TopicSelectionDialog: React.FC<Props> = ({
  topics,
  initialTopics,
  close,
  confirm,
  retry,
  opened,
  loading,
  confirming,
  error,
}) => {
  const intl = useFormatMessage();
  const [selection, setSelection] = useState<number[]>([]);

  useEffect(() => {
    if (!initialTopics) return;
    setSelection((prev) => {
      const cloned = structuredClone(prev);
      return uniq(concat(cloned, initialTopics));
    });
  }, [initialTopics]);

  const disableSelection = useMemo(
    () => selection.length >= MAX_TOPICS_COUNT,
    [selection]
  );

  const dataChanged = useMemo(() => {
    return (
      !initialTopics ||
      selection.some((id) => !initialTopics.includes(id)) ||
      initialTopics.some((id) => !selection.includes(id))
    );
  }, [initialTopics, selection]);

  const onSelect = useCallback(
    (id: number) => {
      if (disableSelection && !selection[id]) return;
      setSelection((prev) => {
        const cloned = structuredClone(prev);
        const updated = cloned.includes(id)
          ? cloned.filter((topic) => topic !== id)
          : concat(cloned, id);
        return uniq(updated);
      });
    },
    [disableSelection, selection]
  );

  const onClose = useCallback(() => {
    close();
    setSelection([]);
  }, [close]);

  return (
    <Dialog
      title={
        <Typography
          tag="div"
          element="subtitle-1"
          weight="bold"
          className="tw-text-natural-950"
        >
          {intl("tutor-settings.topics.selection-dialog.title")}
        </Typography>
      }
      close={confirming ? undefined : onClose}
      open={opened}
    >
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-[744px]">
        <Typography
          element="caption"
          weight="semibold"
          className="tw-text-natural-950 tw-mt-2"
        >
          {intl("tutor-settings.topics.selection-dialog.description")}
        </Typography>

        <AnimatePresence initial={false} mode="wait">
          {loading && !error ? (
            <Animate
              key="loading"
              className="tw-flex tw-justify-center tw-items-center tw-my-20"
            >
              <Loader
                size="medium"
                text={intl("tutor-settings.topics.selection-dialog.loading")}
              />
            </Animate>
          ) : null}

          {error ? (
            <Animate
              key="error"
              className="tw-flex tw-justify-center tw-items-center tw-my-12"
            >
              <LoadingError
                size="medium"
                error={intl("tutor-settings.topics.selection-dialog.error")}
                retry={retry}
              />
            </Animate>
          ) : null}

          {!loading && !error ? (
            <Animate
              key="topics"
              className={cn(
                "tw-flex tw-flex-wrap tw-gap-6 tw-my-12 tw-overflow-auto tw-max-h-[264px]",
                "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
              )}
            >
              {topics.map((topic, i) => (
                <button
                  key={i}
                  disabled={
                    confirming ||
                    (disableSelection && !selection.includes(topic.id))
                  }
                  className={cn(
                    "tw-rounded-2xl tw-p-4 tw-transition-colors tw-duration-200",
                    "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
                    {
                      "tw-bg-natural-100 tw-text-natural-950":
                        !selection.includes(topic.id),
                      "tw-bg-brand-700 tw-text-natural-50":
                        !!selection.includes(topic.id),
                    }
                  )}
                  onClick={() => onSelect(topic.id)}
                >
                  <Typography element="body" weight="medium">
                    {topic.label}
                  </Typography>
                </button>
              ))}
            </Animate>
          ) : null}

          <div className="tw-flex tw-flex-row tw-w-full tw-gap-6">
            <Button
              size={ButtonSize.Large}
              onClick={() => confirm(selection)}
              className="tw-w-full"
              loading={confirming}
              disabled={loading || error || confirming || !dataChanged}
            >
              {intl("labels.confirm")}
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Large}
              onClick={onClose}
              className="tw-w-full"
              disabled={confirming}
            >
              {intl("labels.cancel")}
            </Button>
          </div>
        </AnimatePresence>
      </div>
    </Dialog>
  );
};

export default TopicSelectionDialog;
