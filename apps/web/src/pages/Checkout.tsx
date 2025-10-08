import React, { useEffect, useMemo } from "react";
import { Web } from "@litespace/utils/routes";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@litespace/headless/context/user";
import Content from "@/components/Checkout/Content";
import { asTxTypePayload } from "@/components/Checkout/utils";

const Checkout: React.FC = () => {
  const [params] = useSearchParams();
  const txTypePayload = useMemo(() => asTxTypePayload(params), [params]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!txTypePayload || !user?.id) return navigate(Web.Root);
  }, [navigate, txTypePayload, user?.id]);

  if (!txTypePayload || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      <Content
        txTypePayload={txTypePayload}
        userPhone={user.phone}
        userId={user.id}
      />
    </div>
  );
};

export default Checkout;
