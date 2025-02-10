import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Typography } from "@litespace/ui/Typography";
import React, { useState } from "react";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { Void } from "@litespace/types";
import { Animate } from "@/components/Common/Animate";
import { isEmpty } from "lodash";
import { Button } from "@litespace/ui/Button";
import AddCircle from "@litespace/assets/AddCircle";
import { Loader, LoadingError } from "@litespace/ui/Loading";

export const TopicSelector: React.FC<{
  allTopics: {
    id: number;
    label: string;
  }[];
  selectedTopics: number[];
  setTopics: (topics: number[]) => void;
  retry: Void;
  loading?: boolean;
  error?: boolean;
}> = ({ selectedTopics, allTopics, setTopics, retry, loading, error }) => {
  const { lg } = useMediaQuery();
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <Typography
          element={lg ? "subtitle-2" : "caption"}
          weight="bold"
          className="text-natural-950"
        >
          {intl("settings.edit.personal.topics.title")}
        </Typography>

        <button
          onClick={(e) => {
            // prevents submitting forms; in case it's in one
            e.preventDefault();
            setShowDialog(true);
          }}
        >
          <Typography
            element="caption"
            weight="semibold"
            className="flex text-brand-700"
          >
            {intl("labels.update")}
            <Edit className="w-6 h-6 mr-2" />
          </Typography>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Typography
          element="subtitle-2"
          weight="regular"
          className="text-natural-950 hidden"
        >
          {intl("settings.edit.personal.topics")}
        </Typography>

        {loading ? (
          <div className="mt-6 sm:mt-8">
            <Loader
              size="small"
              text={intl("student-settings.topics.selection-dialog.loading")}
            />
          </div>
        ) : null}

        {error && !loading ? (
          <div className="mt-6 sm:mt-8">
            <LoadingError
              size="small"
              retry={retry}
              error={intl("student-settings.topics.selection-dialog.error")}
            />
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="flex flex-row flex-wrap w-full gap-2">
            {!isEmpty(selectedTopics) ? (
              selectedTopics.map((topicId, i) => (
                <div className="my-3">
                  <Animate>
                    <Typography
                      key={i}
                      element="caption"
                      weight="regular"
                      className="bg-brand-700 text-natural-50 px-4 py-3 rounded-[24px]"
                    >
                      {allTopics.find((t) => t.id === topicId)?.label}
                    </Typography>
                  </Animate>
                </div>
              ))
            ) : (
              <div className="flex justify-center w-full my-3">
                <Animate>
                  <Button
                    size="large"
                    endIcon={
                      <AddCircle className="[&>*]:tw-stroke-natural-50 tw-w-4 tw-h-4" />
                    }
                    onClick={() => setShowDialog(true)}
                  >
                    <Typography
                      element={{
                        default: "tiny-text",
                        sm: "caption",
                        md: "body",
                      }}
                      weight="medium"
                    >
                      {intl("student-settings.add-topics-button.label")}
                    </Typography>
                  </Button>
                </Animate>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <TopicSelectionDialog
        title={intl("student-settings.topics.selection-dialog.title")}
        description={intl(
          "student-settings.topics.selection-dialog.description"
        )}
        topics={allTopics}
        initialTopics={selectedTopics}
        opened={showDialog}
        retry={retry}
        close={() => {
          setTopics(selectedTopics);
          setShowDialog(false);
        }}
        confirm={(topicIds: number[]) => {
          setTopics(topicIds);
          setShowDialog(false);
        }}
      />
    </div>
  );
};
export default TopicSelector;
