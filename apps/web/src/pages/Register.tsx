import Aside from "@/components/Auth/Common/Aside";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import Content from "@/components/Auth/Register/Content";

const Register: React.FC = () => {
  const mq = useMediaQuery();

  return (
    <div className="flex flex-row gap-8 h-full p-4 sm:p-6">
      <Content />
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Register;
