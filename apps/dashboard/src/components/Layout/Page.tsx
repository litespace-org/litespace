import React, { Suspense } from "react";
import { Loading } from "@litespace/ui/Loading";

const Page: React.FC<{ page: React.ReactNode }> = ({ page }) => {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full">
          <div className="mt-[20vh]">
            <Loading size="medium" />
          </div>
        </div>
      }
    >
      {page}
    </Suspense>
  );
};

export default Page;
