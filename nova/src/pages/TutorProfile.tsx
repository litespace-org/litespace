import { atlas, backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import { Button, Color, messages, Variant } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

const TutorProfile: React.FC = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const { isLoading, isError, data } = useQuery({
    queryFn: () => atlas.tutor.findById(Number(id)),
  });

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error</h1>;

  return (
    <div className="max-w-screen-xl mx-auto px-20 py-24">
      <div className="flex flex-row gap-4">
        <div>
          <div className="w-[400px] h-[400px] overflow-hidden rounded-md shadow-lg">
            {data?.photo && (
              <img
                className="w-full h-full object-cover"
                src={asAssetUrl(backend, data?.photo)}
              />
            )}
          </div>
          <div className="my-10">
            {data?.video && (
              <video
                className="inline-block w-[400px] rounded-md overflow-hidden"
                controls
                src={asAssetUrl(backend, data.video)}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-2">
            <p className="text-4xl font-bold font-cairo">{data?.name.ar}</p>
          </div>
          <div className="mb-10">
            <p className="text-xl text-gray-500 font-bold font-cairo">
              {data?.bio}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-400 font-bold font-cairo">
              {data?.about}
            </p>
          </div>
          <div className="flex flex-row flex-wrap gap-3 mt-10">
            <Button>
              {intl.formatMessage({ id: messages["global.book.lesson.label"] })}
            </Button>
            <Button variant={Variant.Outlined}>
              {intl.formatMessage({ id: messages["global.add.to.favorites"] })}
            </Button>
            <Button variant={Variant.Outlined}>
              {intl.formatMessage({ id: messages["global.start.chating"] })}
            </Button>
            <Button color={Color.Error} variant={Variant.Outlined}>
              {intl.formatMessage({ id: messages["global.report.label"] })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
