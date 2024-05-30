import { Route } from "@/types/routes";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@litespace/components";

const Root: React.FC = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to={Route.Login}>Login</Link>
        </li>
        <li>
          <Link to={Route.Register}>Register</Link>
        </li>
      </ul>
      <Button />
    </div>
  );
};

export default Root;
