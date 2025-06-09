import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { AutoComplete, filterQuery } from "@litespace/utils/filterQuery";
import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useRender } from "@litespace/headless/common";
import Info from "@litespace/assets/InfoCircle";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import { useHotkeys } from "react-hotkeys-hook";
import history from "@/components/FilterQuery/history";
import { ZodSchema, infer as Infer } from "zod";

type Form = {
  search: string;
};

export const FilterQuery = <T,>({
  id,
  schema,
  onSubmit,
}: {
  id: string;
  schema: ZodSchema<T>;
  onSubmit: (filter: Infer<Zod.ZodSchema<T>>) => void;
}) => {
  const dialog = useRender();
  const [index, setIndex] = useState<number>(history.tick(id));
  const [focused, setFocused] = useState<boolean>(false);

  const autoComplete = useMemo(() => new AutoComplete(schema), [schema]);
  const help = useMemo(() => autoComplete.help(), [autoComplete]);
  const suggestion = useMemo(() => history.get(id, index), [id, index]);

  const form = useForm<Form>({
    defaults: { search: "" },
    onSubmit({ search }) {
      const filter = filterQuery.parse(search);
      const result = schema.safeParse(filter);
      if (result.success === false || !result.data) return;
      onSubmit(result.data);
      history.save(id, search);
    },
  });

  useHotkeys(
    "arrowUp",
    () => {
      const prev = index - 1;
      if (prev < 0) return setIndex(history.tick(id));
      return setIndex(prev);
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enabled: focused,
    },
    [id, index, focused]
  );

  useHotkeys(
    "arrowDown",
    () => {
      if (index === history.tick(id)) return setIndex(0);
      const next = index + 1;
      return setIndex(next);
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enabled: focused,
    },
    [id, index, focused]
  );

  useHotkeys(
    "tab",
    () => {
      const value = history.get(id, index);
      if (!value) return;
      form.set("search", value);
      setIndex(history.tick(id));
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enabled: focused,
    },
    [form, id, index, focused]
  );

  return (
    <form onSubmit={form.onSubmit} className="relative">
      <Input
        id="filter-query"
        idleDir="ltr"
        endAction={{
          id: 1,
          onClick: dialog.show,
          icon: <Info className="w-4 h-4" />,
        }}
        placeholder={suggestion || ""}
        data-suggestion={!!suggestion}
        className="data-[suggestion=true]:placeholder:text-left"
        value={!suggestion ? form.state.search : ""}
        onChange={(e) => {
          setIndex(history.tick(id));
          form.set("search", e.target.value);
        }}
        state={form.errors.search ? "error" : undefined}
        helper={form.errors.search}
        autoComplete="off"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      <Options
        search={form.state.search}
        values={autoComplete.predict(form.state.search).values}
        select={(value) => form.set("search", form.state.search + value)}
      />
      <HelpDialog help={help} open={dialog.open} close={dialog.hide} />
    </form>
  );
};

const Options: React.FC<{
  search: string;
  values: string[];
  select(value: string): void;
}> = ({ search, values, select }) => {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState<number>(0);

  useEffect(() => {
    if (mirrorRef.current)
      new ResizeObserver(() => {
        setLeft(mirrorRef.current?.clientWidth || 0);
      }).observe(mirrorRef.current);
  }, []);

  return (
    <>
      <div
        data-show={values.length > 0}
        className="absolute top-11 border border-natural-200 shadow-select-menu rounded-lg w-fit min-w-36 max-w-64 bg-natural-50 py-2 hidden data-[show=true]:block"
        style={{ left }}
        dir="ltr"
        tabIndex={1}
      >
        <div className="px-2 flex flex-col max-h-36 overflow-x-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          {values.map((value, index) => (
            <button
              tabIndex={index + 3}
              key={index}
              className="hover:bg-natural-100 py-1 px-2 rounded-lg w-full text-start focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-brand-500"
              type="button"
              onClick={() => select(value)}
            >
              <Typography tag="p" className="text-caption text-natural-950">
                {value}
              </Typography>
            </button>
          ))}
        </div>
      </div>

      <div className="invisible h-0">
        <span ref={mirrorRef} className="text-end mr-auto w-fit block outline">
          {search}
        </span>
      </div>
    </>
  );
};

const HelpDialog: React.FC<{ help: string[]; open: boolean; close: Void }> = ({
  help,
  open,
  close,
}) => {
  const intl = useFormatMessage();
  return (
    <Dialog
      open={open}
      close={close}
      className="w-[512px]"
      title={
        <Typography tag="p" className="text-natural-950 font-bold text-body">
          {intl("dashboard.query-filter.dialog-title")}
        </Typography>
      }
    >
      <div dir="ltr" className="pt-2">
        <ul className="flex flex-col gap-2 max-h-[512px] overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          {help.map((line, index) => (
            <li
              key={index}
              className="border border-natural-100 py-1 px-2 rounded-md"
            >
              <Typography
                tag="p"
                className="text-caption text-natural-950 font-mono"
              >
                {line}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
};

export default FilterQuery;
