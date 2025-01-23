import { Column, Img, Row, Section } from "@react-email/components";
import React from "react";
import { getAsset } from "@/lib/assets";
import { translate } from "@/lib/translate";
import Typography from "@/components/Common/Typography";

const Header: React.FC = () => {
  return (
    <Section className="w-fit">
      <Row style={{ direction: "rtl" }}>
        <Column>
          <Img
            className="ml-2"
            src={getAsset("logo")}
            alt="Logo"
            width="48"
            height="48"
          />
        </Column>
        <Column>
          <Typography element="h4" weight="bold" text="brand-500">
            {translate("labels.litespace")}
          </Typography>
        </Column>
      </Row>
    </Section>
  );
};

export default Header;
