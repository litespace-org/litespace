import React, { ComponentProps } from "react";
import cn from "classnames";

type Props = ComponentProps<"div">;

const Ellipse: React.FC<{ children: React.ReactNode } & Props> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative", className)} {...props}>
      <div
        id="main-top-left"
        className="absolute -top-[500px] -left-[700px] rotate-[12deg] w-[700px] h-[500px] z-landing-ellipse bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
      />
      <div
        id="main-bottom-right"
        className="absolute top-[150px] -right-[440px] rotate-[15deg] w-[600px] h-[430px] z-landing-ellipse bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
      />
      <div
        id="main-bottom-left"
        className="absolute -bottom-[480px] -left-[590px] rotate-[12deg] w-[530px] h-[370px] z-landing-ellipse bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
      />
      <div
        id="main-top-right"
        className="absolute -top-[550px] -right-[580px] rotate-[12deg] w-[530px] h-[370px] z-landing-ellipse bg-brand-600 rounded-[50%/50%] opacity-30 blur-ellipse"
      />
      <div
        id="warning-right"
        className="absolute top-[40px] -right-[140px] rotate-[12deg] w-[350px] h-[250px] z-landing-ellipse bg-warning-600 rounded-[50%/50%] opacity-20 blur-ellipse"
      />
      <div
        id="warning-left"
        className="absolute top-[0px] -left-[450px] rotate-[12deg] w-[350px] h-[250px] z-landing-ellipse bg-warning-600 rounded-[50%/50%] opacity-15 blur-ellipse"
      />

      {children}
    </div>
  );
};

export default Ellipse;
