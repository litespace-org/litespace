import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { Avatar, Layout as AntdLayout, Switch, theme, Typography } from "antd";
import React, { useContext, useMemo } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { IUser } from "@litespace/types";

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser.Self>();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {
      backgroundColor: token.colorBgElevated,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "0px 24px",
      height: "64px",
    };

    if (sticky) {
      style.position = "sticky";
      style.top = 0;
      style.zIndex = 1;
    }

    return style;
  }, [sticky, token.colorBgElevated]);

  return (
    <AntdLayout.Header style={headerStyles}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <div style={{ marginLeft: "8px" }}>
          {user?.name.en && <Text strong>{user.name.en}</Text>}
        </div>
      </div>
    </AntdLayout.Header>
  );
};
