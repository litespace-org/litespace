import * as React from "react";
import { Html, Button } from "@react-email/components";

export default function Email({ url }: { url: string }) {
  return (
    <Html lang="en">
      <Button href={url}>Click me</Button>
    </Html>
  );
}
