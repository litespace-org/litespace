import * as React from "react";
import { Html, Button } from "@react-email/components";

export function ForgetPassword({ url }: { url: string }) {
  return (
    <Html lang="en">
      <Button href={url}>Reset Password</Button>
    </Html>
  );
}
