import Form from "@/components/Auth/Login/Form";
import Title from "@/components/Auth/Common/Title";
import { ForgetPassword } from "@/components/Common/ForgetPassword";
import { useRender } from "@litespace/headless/common";

const Content: React.FC = () => {
  const forgetPasswordDialog = useRender();
  return (
    <main className="flex flex-col gap-10 sm:gap-0 items-center justify-start w-full max-w-[392px] shrink-0 p-6">
      <div className="flex-1 flex flex-col gap-8 justify-center h-full w-full">
        <Title type="login" />
        <Form onForgetPassword={forgetPasswordDialog.show} />
      </div>

      <ForgetPassword
        open={forgetPasswordDialog.open}
        close={forgetPasswordDialog.hide}
      />
    </main>
  );
};

export default Content;
