import React, { useEffect } from "react";
import { useUserContext } from "@litespace/headless/context/user";
import { useNavigate } from "react-router-dom";
import { isTutor } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { isProfileComplete } from "@litespace/utils/tutor";
import Content from "@/components/CompleteTutorProfile/Content";

const CompleteTutorProfile: React.FC = () => {
  const { user, meta, refetch } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !user ||
      !meta ||
      !isTutor(user) ||
      isProfileComplete({ ...user, ...meta })
    )
      return navigate(Web.Root);
  }, [user, navigate, meta]);

  if (!user || !meta) return null;

  return (
    <div className="w-full p-4 md:p6 max-w-screen-lg mx-auto min-h-screen">
      <Content
        tutorId={user.id}
        name={user.name}
        phone={user.phone}
        city={user.city}
        gender={user.gender}
        about={meta.about}
        bio={meta.bio}
        birthYear={user.birthYear}
        verifiedPhone={user.verifiedPhone}
        refetch={() => {
          refetch.user();
          refetch.meta();
        }}
      />
    </div>
  );
};

export default CompleteTutorProfile;
