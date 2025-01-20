import { Heading } from "@react-email/components";
import React from "react";
import Typography from "@/components/common/Typography";
import localId from "@/locales/ar-eg.json";
// import Logo from "@/assets/logo-litespace.png";

const Header: React.FC = () => {
  return (
    <Heading className="m-0 p-0 box-border [&>*]:m-0 [&>*]:p-0 [&>*]:box-border">
      {/* <Img src={Logo} alt="Logo" width="48" height="48" /> */}
      <Typography element="h4" weight="bold" className="text-brand-500">
        {localId["labels.litespace"]}
      </Typography>
    </Heading>
  );
};

export default Header;
