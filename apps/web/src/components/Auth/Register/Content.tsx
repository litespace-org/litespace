import Header from "@/components/Auth/Common/Header";
import Form from "@/components/Auth/Register/Form";
import Title from "@/components/Auth/Common/Title";

const Content: React.FC = () => {
  return (
    <main className="flex flex-col gap-10 sm:gap-0 items-center flex-1 flex-shrink-0 w-full">
      <Header />
      <div className="flex-1 flex flex-col sm:justify-center max-w-[404px] w-full">
        <Title type="register" />
        <Form />
      </div>
    </main>
  );
};

export default Content;
