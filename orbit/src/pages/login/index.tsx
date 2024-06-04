import { AuthPage } from "@refinedev/antd";
import { Typography } from "antd";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      registerLink={false}
      title={<Typography.Title level={2}>LiteSpace</Typography.Title>}
      formProps={{
        initialValues: {
          email: "admin@litespace.com",
          password: "LiteSpace1###",
        },
      }}
    />
  );
};
