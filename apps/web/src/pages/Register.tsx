import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import Logo from "@litespace/assets/Logo";
import RegisterForm from "@/components/Auth/RegisterForm";
import { Typography } from "@litespace/ui/Typography";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useWebFormatMessage } from "@/hooks/intl";

const Register: React.FC = () => {
  const intl = useWebFormatMessage();
  const mq = useMediaQuery();

  return (
    <div className="flex flex-row gap-8 h-full p-4 sm:p-6">
      <main className="flex flex-col gap-10 sm:gap-0 items-center flex-1 flex-shrink-0 w-full">
        <Header />

        <div className="flex-1 flex flex-col sm:justify-center max-w-[404px] w-full">
          <div className="flex flex-row items-center justify-center gap-4 mb-6 sm:mb-8">
            <Logo className="h-[87px]" />
            <div className="flex flex-col gap-2 items-start justify-center">
              <Typography tag="h1" className="text-brand-500 text-h3 font-bold">
                {intl("labels.litespace")}
              </Typography>
              <Typography tag="h2" className="text-natural-700 text-h2">
                {intl("register.welcome")}
              </Typography>
            </div>
          </div>
          <RegisterForm />
        </div>
      </main>

      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Register;
