import React from "react";
import { InView } from "react-intersection-observer";
import Card from "@/components/Tutor/Card";
import { TutorCardProps } from "@/types/tutor";
import { Void } from "@litespace/types";
import { ArrowDownCircle } from "react-feather";
import { Button } from "@litespace/ui/Button";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

const CardWrapper: React.FC<{
  cards: TutorCardProps[];
  more: Void;
  loading: boolean;
  error: boolean;
  thereAreMore: boolean;
}> = ({ cards, more, loading, error, thereAreMore }) => {
  const intl = useFormatMessage();
  return (
    <>
      <div className="flex flex-wrap gap-4">
        {cards.map((card, i) => (
          <Card
            key={i}
            name={card.name}
            image={card.image}
            email={card.email}
            registrationDate={card.registrationDate}
          />
        ))}
      </div>

      {thereAreMore && !loading && !error ? (
        <InView className="self-center" onClick={more} onChange={more}>
          <Button
            size="large"
            variant="tertiary"
            loading={loading}
            startIcon={<ArrowDownCircle />}
          />
        </InView>
      ) : null}

      {loading ? <Loading /> : null}

      {error ? (
        <LoadingError
          size="large"
          retry={more}
          error={intl("error.api.unexpected")}
        />
      ) : null}
    </>
  );
};

export default CardWrapper;
