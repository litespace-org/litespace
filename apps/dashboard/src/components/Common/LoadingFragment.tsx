import { Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import React from "react";

export const LoadingFragment: React.FC<{
  loading?: {
    text?: string;
    size?: "small" | "medium" | "large";
  };
  error?: {
    text?: string;
    size?: "small" | "medium" | "large";
  };
  refetch: Void;
}> = ({ loading, error, refetch }) => {
  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading text={loading.text || ""} size={loading.size} />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center mt-[15vh]">
        <LoadingError
          retry={refetch}
          error={error.text || ""}
          size={error.size}
        />
      </div>
    );
};
