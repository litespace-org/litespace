import { Button, Html } from "@react-email/components";
import React from "react";

export const MyEmail: React.FC = () => {
  return (
    <Html>
      <Button
        href="https://example.com"
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Click me
      </Button>
    </Html>
  );
};

export default MyEmail;
