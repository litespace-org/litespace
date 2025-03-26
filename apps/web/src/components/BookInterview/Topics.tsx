import { Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import cn from "classnames";

export const Topics: React.FC<{
  topics: { id: number; label: string }[];
  userTopics: number[];
  loading: boolean;
  error: boolean;
  chooseTopic: (topic: number) => void;
  retry: Void;
}> = ({ topics, userTopics, loading, error, chooseTopic, retry }) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <Loader
        size="medium"
        text={intl("tutor.onboarding.tutor-info.form.topics.loading")}
      />
    );

  if (error)
    return (
      <LoadingError
        size="medium"
        retry={retry}
        error={intl("tutor.onboarding.tutor-info.form.topics.error")}
      />
    );

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <button
          type="button"
          onClick={() => chooseTopic(topic.id)}
          className={cn(
            "rounded-2xl px-4 py-3",
            userTopics.includes(topic.id)
              ? "bg-brand-700 text-natural-50"
              : "bg-natural-100 text-natural-950"
          )}
          key={topic.id}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
};
