import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Controller, Label } from "@litespace/ui/Form";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import {
  useValidateBio,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { UseFormReturn } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { orUndefined } from "@litespace/utils/utils";
import TopicSelection from "@/components/SharedSettings/TopicSelection";

const PublicSettings: React.FC<{
  video: string | null;
  form: UseFormReturn<ITutorSettingsForm, unknown, undefined>;
}> = ({ video, form }) => {
  const intl = useFormatMessage();
  const validateUserName = useValidateUserName(form.watch("name") !== null);
  const validateBio = useValidateBio(form.watch("bio") !== null);

  return (
    <div className="flex flex-col gap-6 p-10">
      <Typography
        tag="h1"
        className="text-natural-950 text-subtitle-1 font-bold"
      >
        {intl("tutor-settings.personal-info.title")}
      </Typography>
      <div className="flex items-center gap-8">
        <div className="grow flex flex-col">
          <Label>{intl("tutor-settings.personal-info.name")}</Label>
          <Controller.Input
            value={form.watch("name")}
            control={form.control}
            rules={{ validate: validateUserName }}
            autoComplete="off"
            name="name"
          />
        </div>
        <div className="grow flex flex-col">
          <Label>{intl("tutor-settings.personal-info.bio")}</Label>
          <Controller.Input
            value={form.watch("bio")}
            control={form.control}
            rules={{ validate: validateBio }}
            autoComplete="off"
            name="bio"
          />
        </div>
      </div>

      <TopicSelection />

      <Typography
        tag="h2"
        className="text-natural-950 text-subtitle-1 font-bold"
      >
        {intl("tutor-settings.personal-info.about")}
      </Typography>

      <Controller.Textarea
        value={form.watch("about")}
        control={form.control}
        autoComplete="off"
        className="min-h-[172px]"
        name="about"
      />
      <Typography
        tag="h2"
        className="text-natural-950 text-subtitle-1 font-bold"
      >
        {intl("tutor-settings.personal-info.video")}
      </Typography>
      <VideoPlayer src={orUndefined(video)} />
    </div>
  );
};

export default PublicSettings;
