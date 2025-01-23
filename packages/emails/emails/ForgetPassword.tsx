import * as React from "react";
import { Html, Button } from "@react-email/components";

export function ForgetPassword({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Html lang="en">
      <Button href={redirectUrl}>Reset Password</Button>
    </Html>
  );
}

export default ForgetPassword;
