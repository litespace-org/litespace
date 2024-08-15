import { AuthPage } from "@refinedev/antd";
import { Typography, Flex } from "antd";
import { RocketFilled } from "@ant-design/icons";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      registerLink={false}
      rememberMe={false}
      title={
        <Flex gap="10px">
          <RocketFilled style={{ fontSize: "30px" }} />
          <Typography.Title level={2} style={{ marginBottom: "0px" }}>
            LiteSpace
          </Typography.Title>
        </Flex>
      }
      formProps={{
        initialValues: {
          email: "admin@litespace.org",
          password: "LiteSpace432%^&",
        },
      }}
    />
  );
};
