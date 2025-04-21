import React, { useState } from "react";
import { Input, InputProps } from "@/components/Input/Input";
import Eye from "@litespace/assets/Eye";
import EyeSlash from "@litespace/assets/EyeSlash";

export const Password: React.FC<InputProps> = (props) => {
  const [hidden, setHidden] = useState(true);
  return (
    <Input
      autoComplete="off"
      type={hidden ? "password" : "text"}
      placeholder="********************"
      endAction={{
        id: 1,
        icon: hidden ? (
          <EyeSlash className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        ),
        onClick: () => setHidden((prev) => !prev),
      }}
      {...props}
    />
  );
};
