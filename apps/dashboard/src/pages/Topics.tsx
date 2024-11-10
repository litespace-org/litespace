import PageTitle from "@/components/common/PageTitle";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useTopics } from "@litespace/headless/topic";
import List from "@/components/Topics/List";
import { Button } from "@litespace/luna/Button";
import { useRender } from "@litespace/luna/hooks/common";
import TopicDialog from "@/components/Topics/TopicDialog";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Input } from "@litespace/luna/Input";
import { debounce } from "lodash";
import { IFilter, ITopic } from "@litespace/types";
import { orUndefined } from "@litespace/sol/utils";
import { Select } from "@litespace/luna/Select";

const Topics = () => {
  const intl = useFormatMessage();
  const addNewTopic = useRender();

  const [name, setName] = useState<string>("");
  const [orderBy, setOrderBy] =
    useState<ITopic.FindTopicsApiQuery["orderBy"]>("name_ar");
  const [orderDirection, setOrderDirection] = useState<
    ITopic.FindTopicsApiQuery["orderDirection"]
  >(IFilter.OrderDirection.Descending);

  const filter = useMemo(
    () => ({
      name: orUndefined(name),
      orderBy: orUndefined(orderBy),
      orderDirection: orUndefined(orderDirection),
    }),
    [name, orderBy, orderDirection]
  );

  const query = useTopics(filter);

  const debouncedRefetch = useMemo(
    () =>
      debounce(() => {
        query.query.refetch();
      }, 500),
    [query]
  );

  const handleNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      debouncedRefetch();
    },
    [debouncedRefetch]
  );

  const orderOptions = useMemo(
    () => [
      { label: intl("dashboard.topics.name.ar"), value: "name_ar" },
      { label: intl("dashboard.topics.name.en"), value: "name_en" },
      { label: intl("global.created-at"), value: "created_at" },
      { label: intl("global.updated-at"), value: "updated_at" },
    ],
    [intl]
  );

  const handleOrderChange = useCallback(
    (value: string) => {
      setOrderBy(value as ITopic.FindTopicsApiQuery["orderBy"]);
      debouncedRefetch();
    },
    [debouncedRefetch]
  );

  const orderDirectionOptions = useMemo(
    () => [
      {
        label: intl("dashboard.filter.order-direction.asc"),
        value: IFilter.OrderDirection.Ascending,
      },
      {
        label: intl("dashboard.filter.order-direction.desc"),
        value: IFilter.OrderDirection.Descending,
      },
    ],
    [intl]
  );

  const handleOrderDirectionChange = useCallback(
    (value: string) => {
      setOrderDirection(value as ITopic.FindTopicsApiQuery["orderDirection"]);
      debouncedRefetch();
    },
    [debouncedRefetch]
  );

  return (
    <div className="p-8">
      <div className="flex justify-between">
        <div>
          <PageTitle
            title={intl("dashboard.topics.title")}
            fetching={query.query.isFetching}
            count={query.totalPages}
          />
          <div className="flex gap-4 mt-2">
            <Input
              onChange={handleNameChange}
              value={name}
              placeholder={intl("dashboard.topics.name")}
            />
            <Select
              onChange={handleOrderChange}
              options={orderOptions}
              value={orderBy}
            />
            <Select
              size={"small"}
              onChange={handleOrderDirectionChange}
              options={orderDirectionOptions}
              value={orderDirection}
            />
          </div>
        </div>
        <Button onClick={addNewTopic.show}>
          {intl("dashboard.topics.add")}
        </Button>
      </div>
      <div className="mt-4">
        <List {...query} query={query} />
      </div>
      <TopicDialog
        close={addNewTopic.hide}
        open={addNewTopic.open}
        onUpdate={query.query.refetch}
      />
    </div>
  );
};

export default Topics;
