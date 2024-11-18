import { useAssetBlob } from "@litespace/headless/asset";
import { User } from "react-feather";
import cn from "classnames";
import { Loading } from "@litespace/luna/Loading";
import { useMemo } from "react";
import { orUndefined } from "@litespace/sol/utils";

const ProfileImage: React.FC<{
  image: string | null;
  imgClassName?: string;
}> = ({ image, imgClassName }) => {
  const asset = useAssetBlob({ name: orUndefined(image), type: "public" });

  const url = useMemo(() => {
    const data = asset.data;
    if (!data) return null;
    return URL.createObjectURL(data);
  }, [asset.data]);

  if (asset.isLoading) return <Loading />;

  return url ? (
    <img className={cn("rounded-full w-10 h-10", imgClassName)} src={url} />
  ) : (
    <div className="border-2 border-black rounded-full">
      <User className="w-10 h-10" />
    </div>
  );
};

export default ProfileImage;
