import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { Loading, LoadingError } from "@/components/Loading";
import { concat, isEmpty, uniq } from "lodash";
import { MAX_TOPICS_COUNT } from "@litespace/utils";
import { Animate } from "@/components/Animate";
import { AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { InView } from "react-intersection-observer";

type Props = {
  title: string;
  description: string;
  topics: Array<{
    id: number;
    label: string;
  }>;
  opened: boolean;
  initialTopics?: number[];
  confirming?: boolean;
  hasMore: boolean;
  loading?: boolean;
  error?: boolean;
  close: Void;
  more: Void;
  retry: Void;
  confirm: (topicIds: number[]) => void;
};

export const TopicSelectionDialog: React.FC<Props> = ({
  title,
  description,
  topics,
  initialTopics,
  opened,
  loading,
  confirming,
  error,
  hasMore,
  close,
  confirm,
  retry,
  more,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
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
          tag="h1"
          className="text-natural-950 font-bold text-body md:text-subtitle-1"
        >
          {title}
        </Typography>
      }
      className="w-full md:w-[512px]"
      close={confirming ? undefined : onClose}
      open={opened}
      position={mq.sm ? "center" : "bottom"}
    >
      <div className="flex flex-col items-center justify-center mt-4 md:mt-2">
        <Typography
          tag="p"
          className="text-natural-700 mt-2 font-semibold text-tiny md:text-caption sm:text-caption"
        >
          {description}
        </Typography>

        <AnimatePresence initial={false} mode="wait">
          {!isEmpty(topics) ? (
            <TopicList
              hasMore={hasMore}
              disableSelection={disableSelection}
              more={more}
              onSelect={onSelect}
              selection={selection}
              topics={topics}
              confirming={confirming}
              error={error}
              loading={loading}
            />
          ) : null}

          {loading && !error ? (
            <Animate
              key="loading"
              className="flex justify-center items-center my-20"
            >
              <Loading
                size="medium"
                text={intl("tutor-settings.topics.selection-dialog.loading")}
              />
            </Animate>
          ) : null}

          {error || isEmpty(topics) ? (
            <Animate
              key="error"
              className="flex justify-center items-center my-12"
            >
              <LoadingError
                size="medium"
                error={intl("tutor-settings.topics.selection-dialog.error")}
                retry={retry}
              />
            </Animate>
          ) : null}

          <div className="flex flex-row w-full gap-4 lg:gap-6">
            <Button
              size="large"
              variant="primary"
              loading={confirming}
              className="w-full"
              onClick={() => confirm(selection)}
              disabled={loading || error || confirming || !dataChanged}
            >
              <Typography tag="span" className="text-body font-medium">
                {intl("labels.confirm")}
              </Typography>
            </Button>
            <Button
              size="large"
              onClick={onClose}
              variant="secondary"
              className="w-full"
              disabled={confirming}
            >
              <Typography tag="span" className="text-body font-medium">
                {intl("labels.cancel")}
              </Typography>
            </Button>
          </div>
        </AnimatePresence>
      </div>
    </Dialog>
  );
};

const TopicBadge: React.FC<{
  topic: { id: number; label: string };
  onSelect: (id: number) => void;
  selected: boolean;
  disabled: boolean;
}> = ({ selected, disabled, topic, onSelect }) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        "rounded-full p-3 md:py-2 md:px-3 transition-colors duration-200 border",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-natural-100 text-natural-950 border-transparent": !selected,
          "bg-brand-200 border-brand-700 text-brand-700": !!selected,
        }
      )}
      onClick={() => onSelect(topic.id)}
    >
      <Typography
        tag="span"
        className="font-semibold md:font-medium text-tiny md:text-body sm:text-caption"
      >
        {topic.label}
      </Typography>
    </button>
  );
};

const TopicList: React.FC<{
  confirming?: boolean;
  disableSelection: boolean;
  selection: number[];
  topics: { id: number; label: string }[];
  onSelect: (id: number) => void;
  hasMore: boolean;
  loading?: boolean;
  error?: boolean;
  more: Void;
}> = ({
  topics,
  selection,
  disableSelection,
  confirming,
  loading,
  error,
  hasMore,
  more,
  onSelect,
}) => {
  return (
    <Animate
      key="topics"
      className={cn(
        "my-8 md:my-6 overflow-auto max-h-[150px] lg:max-h-[264px]",
        "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
      )}
    >
      <div className="flex flex-wrap gap-2 md:gap-4">
        {topics.map((topic) => (
          <TopicBadge
            key={topic.id}
            topic={topic}
            onSelect={onSelect}
            disabled={
              confirming || (disableSelection && !selection.includes(topic.id))
            }
            selected={selection.includes(topic.id)}
          />
        ))}
      </div>

      {loading ? <Loading size="small" /> : null}

      {hasMore && !loading && !error ? (
        <InView
          onChange={(inview) => {
            if (inview) more();
          }}
        />
      ) : null}
    </Animate>
  );
};

export default TopicSelectionDialog;
