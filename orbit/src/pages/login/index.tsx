import { AuthPage } from "@refinedev/antd";
import { OAuthProvider } from "@refinedev/core";
import {
  GoogleOutlined,
  GoogleSquareFilled,
  FacebookFilled,
  DiscordFilled,
} from "@ant-design/icons";

export const providers: OAuthProvider[] = [
  {
    name: "google",
    icon: <GoogleSquareFilled />,
    label: "Sign in with Google",
  },
  {
    name: "facebook",
    icon: <FacebookFilled />,
    label: "Sign in with Facebook",
  },
  {
    name: "discord",
    icon: <DiscordFilled />,
    label: "Sign in with Discord",
  },
];

export const Login = () => {
  return (
    <AuthPage
      type="login"
      providers={providers}
      registerLink={false}
      formProps={{
        initialValues: { email: "demo@refine.dev", password: "demodemo" },
      }}
    />
  );
};
