import React, { useEffect, useState } from "react";
import { AssetId } from "@litespace/assets";

const Svg: React.FC<{
  id: AssetId;
  className?: string;
}> = ({ id, className = "" }) => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    fetch(`/${id}`)
      .then((res) => res.text())
      .then(setContent);
  }, [id]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content.replace("<svg", `<svg class="${className}"`),
      }}
    />
  );
};

export default Svg;
