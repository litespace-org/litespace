import { Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import React from "react";
import cn from "classnames";

type Size = "small" | "medium" | "large";

export const LoadingFragment: React.FC<{
  tight?: boolean;
  loading?: { text?: string; size?: Size };
  error?: { text?: string; size?: Size };
  refetch: Void;
}> = ({ tight, loading, error, refetch }) => {
  if (loading)
    return (
      <div className={cn({ "mt-[15vh]": !tight })}>
        <Loading text={loading.text} size={loading.size} />
      </div>
    );

  if (error)
    return (
      <div
        className={cn("flex justify-center items-center", {
          "mt-[15vh]": !tight,
        })}
      >
        <LoadingError retry={refetch} error={error.text} size={error.size} />
      </div>
    );
};
