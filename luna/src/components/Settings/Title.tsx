import { useFormatMessage } from "@/hooks";
import Spinner from "@/icons/Spinner";
import { LocalId } from "@/locales";
import React from "react";

const Title: React.FC<{ loading: boolean; title: LocalId }> = ({
  loading,
  title,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-mb-6 tw-pb-3 tw-border-b tw-border-border-stronger">
      <h3 className="tw-text-2xl lg:tw-text-3xl">{intl(title)}</h3>
      <Spinner
        data-show={loading}
        className="tw-hidden data-[show=true]:tw-block"
      />
    </div>
  );
};

export default Title;
