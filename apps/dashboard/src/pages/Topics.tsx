import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useTopics } from "@litespace/headless/topic";
import List from "@/components/Topics/List";
import { Button } from "@litespace/ui/Button";
import { useRender } from "@litespace/ui/hooks/common";
import TopicDialog from "@/components/Topics/TopicDialog";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Input } from "@litespace/ui/Input";
import { debounce } from "lodash";
import { IFilter, ITopic } from "@litespace/types";
import { orUndefined } from "@litespace/utils/utils";
import { Select } from "@litespace/ui/Select";

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
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <div className="flex flex-row justify-between">
        <PageTitle
          title={intl("dashboard.topics.title")}
          fetching={query.query.isFetching && !query.query.isLoading}
          count={query.totalPages}
        />
        <Button size={"small"} onClick={addNewTopic.show}>
          {intl("dashboard.topics.add")}
        </Button>
      </div>

      <div className="flex flex-row justify-start gap-4 mt-2">
        <Input
          onChange={handleNameChange}
          placeholder={intl("dashboard.topics.name")}
          value={name}
        />

        <Select
          onChange={handleOrderChange}
          options={orderOptions}
          value={orderBy}
        />
        <Select
          onChange={handleOrderDirectionChange}
          options={orderDirectionOptions}
          value={orderDirection}
        />
      </div>

      <div className="mt-4">
        <List {...query} topics={query} />
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
