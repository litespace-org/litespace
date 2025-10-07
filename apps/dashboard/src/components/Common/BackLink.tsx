import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";

const BackLink: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();

  return (
    <Link
      to="#"
      className="flex items-center gap-2 py-1 px-2 text-base duration-300 rounded-lg hover:bg-background-selection w-fit"
      onClick={() => navigate(-1)}
      tabIndex={-1}
    >
      <Button
        variant="secondary"
        type="natural"
        startIcon={<ArrowRightIcon className="icon" />}
      >
        <Typography tag="span">{intl("labels.go-back")}</Typography>
      </Button>
    </Link>
  );
};

export default BackLink;
