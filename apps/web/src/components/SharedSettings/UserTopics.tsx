import Add from "@litespace/assets/Add";
import Edit from "@litespace/assets/Edit";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { Typography } from "@litespace/ui/Typography";

const UserTopics: React.FC<{
  error?: boolean;
  loading?: boolean;
  title: string;
  topics: Array<{ id: number; label: string }>;
  edit: Void;
  retry: Void;
}> = ({ edit, title, topics, loading, error, retry }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Typography
          element={"subtitle-2"}
          weight="bold"
          className="text-natural-950"
        >
          {title}
        </Typography>
        <button
          type="button"
          onClick={edit}
          className="flex gap-2 items-center"
        >
          <Typography
            element="caption"
            weight="semibold"
            className="text-brand-700"
          >
            {intl("global.labels.edit")}
          </Typography>
          <Edit width={24} height={24} className="[&>*]:stroke-brand-700" />
        </button>
      </div>
      {loading ? (
        <div className="mt-4">
          <Loader
            text={intl("student-settings.edit.personal.topics.loading")}
            size="small"
          />
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <LoadingError
            error={intl("student-settings.edit.personal.topics.error")}
            retry={retry}
            size="small"
          />
        </div>
      ) : null}
      {!loading && !error ? (
        <div className="flex gap-2 flex-wrap">
          {topics.length === 0 ? (
            <Button
              size="large"
              className="max-w-[344px] text-xs md:text-base flex gap-2 mx-auto items-center px-8"
              onClick={edit}
            >
              {intl("tutor-settings.topics.update")}
              <Add />
            </Button>
          ) : null}
          {topics.map((topic) => (
            <div className="bg-brand-700 rounded-3xl py-3 px-4" key={topic.id}>
              <Typography className="text-natural-50" element="caption">
                {topic.label}
              </Typography>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default UserTopics;
