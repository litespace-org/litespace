import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findMe, profileSelector } from "@/redux/user/me";
import { User } from "@/types";
import { Route } from "@/types/routes";
import { Button, messages } from "@litespace/luna";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import male from "@/assets/male-astronaut.png";
import female from "@/assets/female-astronaut.png";
import { atlas } from "@/lib/atlas";

const SelectUserGender: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const profile = useAppSelector(profileSelector);
  const mutation = useMutation(
    async (gender: User.Gender) => atlas.user.update(1, { gender }),
    {
      async onSuccess() {
        await dispatch(findMe());
        await navigate(Route.Root);
      },
    }
  );

  useEffect(() => {
    if (profile && profile.gender) return navigate(Route.Root);
  }, [navigate, profile]);

  return (
    <div className="max-w-screen-md mx-auto flex flex-col items-center justify-center min-h-screen gap-10">
      <h1 className="text-5xl">
        <FormattedMessage id={messages.pages.select.gender.title} />
      </h1>
      <div className="flex flex-row gap-5">
        <Button onClick={() => mutation.mutate(User.Gender.Male)}>
          <img src={male} />
        </Button>
        <Button onClick={() => mutation.mutate(User.Gender.Female)}>
          <img src={female} />
        </Button>
      </div>
    </div>
  );
};

export default SelectUserGender;
