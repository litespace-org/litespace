import * as React from "react";
import { Html, Button } from "@react-email/components";

export function VerifyEmail({ url }: { url: string }) {
  return (
    <Html lang="en">
      <Button href={url}>Verify Email</Button>
    </Html>
  );
}
