import { Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import React from "react";

export const LoadingFragment: React.FC<{
  text?: {
    loading?: string;
    error?: string;
  };
  loading: boolean;
  error: boolean;
  refetch: Void;
}> = ({ text, loading, error, refetch }) => {
  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading text={text?.loading || ""} size="large" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center mt-[15vh]">
        <LoadingError size="medium" retry={refetch} error={text?.error || ""} />
      </div>
    );
};
