import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import { Dialog } from "@/components/Dialog/V2";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";

type Props = {
  topics: Array<{
    id: number;
    label: string;
  }>;
  close: Void;
  retry: Void;
  confirm: (topicIds: number[]) => void;
  opened: boolean;
  selectedTopicIds?: Array<number>;
  confirming?: boolean;
  loading?: boolean;
  error?: boolean;
};

export const TopicSelectionDialog: React.FC<Props> = ({
  topics,
  selectedTopicIds,
  close,
  confirm,
  retry,
  opened,
  loading,
  confirming,
  error,
}) => {
  const intl = useFormatMessage();
  const [selectionRecord, setSelectionRecord] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (!selectedTopicIds) return;
    setSelectionRecord((prev) => {
      const newRecord = { ...prev };
      selectedTopicIds.forEach((id) => {
        newRecord[id] = true;
      });
      return newRecord;
    });
  }, [selectedTopicIds]);

  const selectTopicHandler = useCallback(
    (id: number) => {
      setSelectionRecord((prev) => {
        const newRecord = { ...prev };
        if (prev[id]) delete newRecord[id];
        else newRecord[id] = !prev[id];
        return newRecord;
      });
    },
    [setSelectionRecord]
  );

  return (
    <Dialog
      title={
        <div className="tw-flex tw-gap-2 tw-items-center">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="tw-text-natural-950"
          >
            {intl("tutor.profile.topics-dialog.title")}
          </Typography>
        </div>
      }
      close={confirming ? undefined : close}
      open={opened}
    >
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
        <Typography
          element="caption"
          weight="semibold"
          className="tw-text-natural-950 tw-mt-2"
        >
          {intl("tutor.profile.topics-dialog.desc")}
        </Typography>

        {loading && !error ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-my-20">
            <Loader
              size="medium"
              text={intl("tutors.schedule.loading.message")}
            />
          </div>
        ) : null}

        {error ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-my-12">
            <LoadingError
              size="medium"
              error={intl("tutors.schedule.error.message")}
              retry={retry}
            />
          </div>
        ) : null}

        {!loading && !error ? (
          <div
            className={cn(
              "tw-flex tw-flex-wrap tw-gap-6 tw-my-12 tw-overflow-auto tw-max-h-[264px]",
              "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
            )}
          >
            {topics.map((topic, i) => (
              <Button
                key={i}
                className={cn("tw-rounded-2xl", {
                  "tw-bg-natural-100 tw-text-natural-950 hover:tw-text-natural-50":
                    !!selectionRecord[topic.id] === false,
                  "tw-bg-primary-700 tw-text-natural-50":
                    !!selectionRecord[topic.id] === true,
                  "focus:tw-bg-natural-100 focus:tw-text-natural-950":
                    !!selectionRecord[topic.id] === false,
                  "focus:tw-bg-primary-700 focus:tw-text-natural-50":
                    !!selectionRecord[topic.id] === true,
                })}
                onClick={() => selectTopicHandler(topic.id)}
              >
                <Typography>{topic.label}</Typography>
              </Button>
            ))}
            {/* disable options buttons while confirming */}
            <div
              className="tw-absolute tw-h-full tw-w-full"
              hidden={!confirming}
            ></div>
          </div>
        ) : null}

        <div className="tw-flex tw-flex-row tw-w-full tw-gap-6">
          <Button
            size={ButtonSize.Large}
            onClick={() =>
              confirm(Object.keys(selectionRecord).map((key) => Number(key)))
            }
            className="tw-w-full"
            loading={confirming}
            disabled={loading || error || confirming}
          >
            {intl("labels.confirm")}
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Large}
            onClick={close}
            className="tw-w-full"
            disabled={confirming}
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default TopicSelectionDialog;
