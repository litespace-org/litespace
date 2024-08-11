import { atlas, backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import { Button, ButtonType, messages } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import dayjs from "@/lib/dayjs";

const TutorProfile: React.FC = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const tutor = useQuery({
    queryKey: "tutor-profile",
    queryFn: () => atlas.tutor.findById(Number(id)),
    retry: false,
  });

  const ratings = useQuery({
    queryKey: "tutor-rating",
    queryFn: async () => {
      if (!tutor.data?.id) return [];
      return await atlas.rating.findRateeRatings(tutor.data.id);
    },
    enabled: !!tutor.data,
    retry: false,
  });

  if (tutor.isLoading) return <h1>Loading...</h1>;
  if (tutor.isError) return <h1>Error</h1>;

  return (
    <div className="max-w-screen-xl mx-auto px-20 py-24 font-cairo bg-dash-sidebar">
      <div className="flex flex-row gap-4">
        <div>
          <div className="w-[400px] h-[400px] overflow-hidden rounded-md shadow-lg">
            {tutor.data?.photo && (
              <img
                className="w-full h-full object-cover"
                src={asAssetUrl(backend, tutor.data?.photo)}
              />
            )}
          </div>
          <div className="my-10">
            {tutor.data?.video && (
              <video
                className="inline-block w-[400px] rounded-md overflow-hidden"
                controls
                src={asAssetUrl(backend, tutor.data.video)}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-2">
            <p className="text-4xl font-bold font-cairo">
              {tutor.data?.name?.ar}
            </p>
          </div>
          <div className="mb-10">
            <p className="text-xl text-gray-500 font-bold font-cairo">
              {tutor.data?.bio}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-400 font-bold font-cairo">
              {tutor.data?.about}
            </p>
          </div>
          <div className="flex flex-row flex-wrap gap-3 mt-10">
            <Button>
              {intl.formatMessage({ id: messages["global.book.lesson.label"] })}
            </Button>
            <Button type={ButtonType.Secondary}>
              {intl.formatMessage({ id: messages["global.add.to.favorites"] })}
            </Button>
            <Button type={ButtonType.Secondary}>
              {intl.formatMessage({ id: messages["global.start.chating"] })}
            </Button>
            <Button type={ButtonType.Error}>
              {intl.formatMessage({ id: messages["global.report.label"] })}
            </Button>
          </div>

          <div>
            {ratings.isLoading ? (
              <p>Loading ratings...</p>
            ) : ratings.error ? (
              <p>Failed to get tutor ratings</p>
            ) : ratings.data ? (
              <div className="mt-10">
                {ratings.data.map((rating) => (
                  <div
                    key={rating.id}
                    className="bg-gray-100 p-4 rounded-sm shadow-lg"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-[90px] h-[90px] rounded-full shadow-2xl">
                        <img
                          className="w-full h-full object-cover"
                          src={asAssetUrl(backend, rating.rater.photo!)}
                        />
                      </div>
                      <div>
                        <p className="text-2xl">{rating.rater.name.ar}</p>
                        <p>{dayjs(rating.createdAt).fromNow()}</p>
                      </div>
                    </div>

                    <div>
                      <p>Rating: {rating.value}</p>
                      <p>{rating.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
