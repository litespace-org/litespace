import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Label } from "@litespace/luna/Form";
import { VideoPlayer } from "@litespace/luna/VideoPlayer";
import Edit from "@litespace/assets/Edit";
import { Input } from "@litespace/luna/Input";
import { Textarea } from "@litespace/luna/Textarea";

export const TutorPersonalInfoSettings: React.FC<{
  video: string | null;
  name: string | null;
  bio: string | null;
  about: string | null;
  topics: string[];
  update: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}> = ({ name, bio, about, video, update }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-6 p-10">
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.title")}
      </Typography>
      <div className="flex items-center gap-8">
        <div className="grow flex flex-col gap-2">
          <Label>{intl("tutor-settings.personal-info.name")}</Label>
          <Input
            onChange={update}
            name="name"
            defaultValue={name || ""}
            autoComplete="off"
          />
        </div>
        <div className="grow flex flex-col gap-2">
          <Label>{intl("tutor-settings.personal-info.bio")}</Label>
          <Input
            onChange={update}
            name="bio"
            defaultValue={bio || ""}
            autoComplete="off"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="text-natural-950"
          >
            {intl("tutor-settings.personal-info.topics")}
          </Typography>
          <div role="button" className="flex gap-2 items-center">
            <Typography
              element="caption"
              weight="semibold"
              className="text-brand-700"
            >
              {intl("global.labels.edit")}
            </Typography>
            <Edit className="[&>*]:stroke-brand-700" />
          </div>
        </div>
        <div>TOPICS</div>
      </div>
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.about")}
      </Typography>

      <Textarea
        onChange={update}
        name="about"
        className="min-h-[172px]"
        defaultValue={about || ""}
        autoComplete="off"
      />
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.video")}
      </Typography>
      <VideoPlayer src={video || ""} />
    </div>
  );
};
