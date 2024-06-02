import { user } from "@/api";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findMe, profileSelector } from "@/redux/user/me";
import { User } from "@/types";
import { Route } from "@/types/routes";
import { Button, messages } from "@litespace/uilib";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

const SelectUserType: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const profile = useAppSelector(profileSelector);
  const mutation = useMutation(
    async (type: User.Type.Tutor | User.Type.Student) => user.update({ type }),
    {
      async onSuccess() {
        await dispatch(findMe());
        await navigate(Route.SelectUserGender);
      },
    }
  );

  useEffect(() => {
    if (profile && profile.type) navigate(Route.Root);
  }, [navigate, profile]);

  return (
    <div className="max-w-screen-md mx-auto flex flex-col items-center justify-center min-h-screen gap-10">
      <h1 className="text-5xl">
        <FormattedMessage id={messages.pages.select.type.title} />
      </h1>
      <div className="flex flex-row gap-5">
        <Button onClick={() => mutation.mutate(User.Type.Tutor)}>
          <FormattedMessage id={messages.pages.select.type.options.tutor} />
        </Button>
        <Button onClick={() => mutation.mutate(User.Type.Student)}>
          <FormattedMessage id={messages.pages.select.type.options.student} />
        </Button>
      </div>
    </div>
  );
};

export default SelectUserType;
