import { Route } from "@/types/routes";
import { Button, ButtonType } from "@litespace/luna";
import React from "react";
import { Link } from "react-router-dom";

const CallFeedback: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <Link to={Route.Root}>
        <Button type={ButtonType.Primary}>Go to Home Page</Button>{" "}
      </Link>
    </div>
  );
};

export default CallFeedback;
