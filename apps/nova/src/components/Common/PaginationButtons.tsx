import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import { Button, ButtonType, ButtonVariant } from "@litespace/luna/Button";
import { Void } from "@litespace/types";

const PaginationButtons: React.FC<{
  page: number;
  totalPages: number;
  gotoFirstPage: Void;
  prev: Void;
  next: Void;
  gotoLastPage: Void;
}> = ({ page, gotoFirstPage, gotoLastPage, prev, next, totalPages }) => {
  return (
    <div className="flex justify-end items-center gap-6 mt-12">
      <Button
        disabled={page === 1}
        onClick={gotoFirstPage}
        variant={ButtonVariant.Tertiary}
        type={ButtonType.Main}
      >
        <ArrowRight />
      </Button>
      {page - 1 > 0 ? (
        <Button
          variant={ButtonVariant.Tertiary}
          className="font-semibold"
          onClick={prev}
          type={ButtonType.Main}
        >
          {page - 1}
        </Button>
      ) : null}
      <Button
        variant={ButtonVariant.Primary}
        className="font-semibold"
        type={ButtonType.Main}
      >
        {page}
      </Button>
      {page + 1 < totalPages ? (
        <Button
          variant={ButtonVariant.Tertiary}
          className="font-semibold"
          onClick={next}
          type={ButtonType.Main}
        >
          {page + 1}
        </Button>
      ) : null}
      <Button
        disabled={page === totalPages}
        onClick={gotoLastPage}
        variant={ButtonVariant.Tertiary}
        type={ButtonType.Main}
      >
        <ArrowLeft />
      </Button>
    </div>
  );
};

export default PaginationButtons;
