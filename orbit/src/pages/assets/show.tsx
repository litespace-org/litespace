import { ICoupon } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";

export const AssetShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ICoupon.MappedAttributes>({});

  console.log({ data });

  return <Show isLoading={isLoading} title="Asset"></Show>;
};
