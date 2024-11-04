import React from "react";

const Detail: React.FC<{
  label: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div>
      <h3 className="text-xl">{label}</h3>
      <div className="text-lg text-foreground-lighter">{children}</div>
    </div>
  );
};

export default Detail;
