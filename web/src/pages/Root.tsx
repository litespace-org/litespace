import { auth } from "@/api";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findMe, profileSelector } from "@/redux/user/me";
import { Route } from "@/types/routes";
import { Button, messages } from "@litespace/uilib";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";

const Root: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const profile = useAppSelector(profileSelector);

  const mutation = useMutation(auth.logout, {
    onSuccess() {
      dispatch(findMe());
    },
  });

  // todo: should be move into the shared layout
  useEffect(() => {
    if (profile && profile.name === null) return navigate(Route.SetUserName);
    if (profile && profile.type === null) return navigate(Route.SelectUserType);
  }, [navigate, profile]);

  return (
    <div className="mx-auto max-w-screen-md my-10">
      <ul className="flex flex-col gap-4">
        <li>
          <Link to={Route.Login}>
            <Button>
              <FormattedMessage id={messages.pages.login.form.title} />
            </Button>
          </Link>
        </li>
        <li>
          <Link to={Route.Register.replace(":type", "tutor")}>
            <Button>
              <FormattedMessage id={messages.pages.register.form.title} /> Tutor
            </Button>
          </Link>
        </li>
        <li>
          <Link to={Route.Register.replace(":type", "student")}>
            <Button>
              <FormattedMessage id={messages.pages.register.form.title} />{" "}
              Student
            </Button>
          </Link>
        </li>
        <li>
          <Button onClick={mutation.mutate}>
            <FormattedMessage id={messages.global.logout} />
          </Button>
        </li>
      </ul>

      <div className="mt-10">
        <pre
          className="bg-gray-50 p-3 rounded-md text-gray-700 font-mono"
          dir="ltr"
        >
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Root;
