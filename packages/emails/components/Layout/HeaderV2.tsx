import { Column, Img, Row, Section } from "@react-email/components";
import React from "react";
import { getAsset } from "@/lib/assets";
import { translate } from "@/components/Common/Translate";
import Typography from "@/components/Common/TypographyV2";

const Header: React.FC = () => {
  return (
    <Section className="w-fit">
      <Row style={{ direction: "rtl" }}>
        <Column>
          <Typography element="h4" weight="bold" text="brand-500">
            {translate("labels.litespace")}
          </Typography>
        </Column>
        <Column>
          <Img
            className="mr-2"
            src={getAsset("logo")}
            alt="LiteSpace"
            width="48"
            height="48"
          />
        </Column>
      </Row>
    </Section>
  );
};

export default Header;
