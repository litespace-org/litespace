import { auth } from "@/api";
import { useAppDispatch } from "@/redux/store";
import { findMe } from "@/redux/user/me";
import { Route } from "@/types/routes";
import { Button, messages } from "@litespace/uilib";
import React from "react";
import { FormattedMessage } from "react-intl";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

const Root: React.FC = () => {
  const dispatch = useAppDispatch();
  const mutation = useMutation(auth.logout, {
    onSuccess() {
      dispatch(findMe());
    },
  });
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
          <Link to={Route.Register}>
            <Button>
              <FormattedMessage id={messages.pages.register.form.title} />
            </Button>
          </Link>
        </li>
        <li>
          <Button onClick={mutation.mutate}>
            <FormattedMessage id={messages.global.logout} />
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default Root;
