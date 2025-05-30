import React, { useEffect } from "react";
import { useUser } from "@litespace/headless/context/user";
import { useNavigate } from "react-router-dom";
import { isTutor } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { isProfileComplete } from "@litespace/utils/tutor";
import Content from "@/components/CompleteTutorProfile/Content";

const CompleteTutorProfile: React.FC = () => {
  const { user, meta, refetch } = useUser();
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
    <div className="w-full h-full p-4 md:p6 max-w-screen-lg mx-auto min-h-screen">
      <Content
        tutorId={user.id}
        name={user.name}
        phone={user.phone}
        email={user.email}
        city={user.city}
        gender={user.gender}
        about={meta.about}
        bio={meta.bio}
        birthYear={user.birthYear}
        verifiedPhone={user.verifiedPhone}
        verifiedEmail={user.verifiedEmail}
        refetch={() => {
          refetch.user();
          refetch.meta();
        }}
      />
    </div>
  );
};

export default CompleteTutorProfile;
