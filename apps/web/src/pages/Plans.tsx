import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/Plans/Content";
import { data } from "@/components/Plans/data.json";
import { PlansDataProps } from "@/components/Plans/types";
import { useWebFormatMessage } from "@/hooks/intl";

export const Plans: React.FC = () => {
  const intl = useWebFormatMessage();

  return (
    <div className="w-full p-4 md:p-6 mx-auto max-w-screen-3xl">
      <PageTitle title={intl("plans.title")} className="mb-4 md:mb-6" />
      <Content plans={data as PlansDataProps} />
    </div>
  );
};

export default Plans;
