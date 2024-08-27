import { atlas } from "@/lib/atlas";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { setUserRules } from "@/redux/user/schedule";
import { messages, Popover, Switch, toaster } from "@litespace/luna";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useMutation } from "react-query";

const ToggleRule: React.FC<{ id: number; activated: boolean }> = ({
  id,
  activated,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelector);
  const [active, setActive] = useState<boolean>(activated);

  useEffect(() => {
    // roll back to the rule current active state
    setActive(activated);
  }, [activated]);

  const onSuccess = useCallback(async () => {
    if (!profile) return;
    await atlas.rule
      .findUserRules(profile.id)
      .then((rules) => dispatch(setUserRules(rules)))
      .catch(() => {
        setActive(!activated);
      });
  }, [activated, dispatch, profile]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.error({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
      // roll back to the current rule state
      setActive(activated);
    },
    [activated, intl]
  );

  const mutation = useMutation({
    mutationFn: useCallback(
      (activated: boolean) => atlas.rule.update(id, { activated }),
      [id]
    ),
    onSuccess,
    onError,
  });

  const onChange = useCallback(
    (checked: boolean) => {
      // optimistic updates
      setActive(checked);
      mutation.mutate(checked);
    },
    [mutation]
  );

  const title = useMemo(
    () =>
      intl.formatMessage({
        id: activated
          ? messages["page.schedule.rule.toggle.active"]
          : messages["page.schedule.rule.toggle.inactive"],
      }),
    [activated, intl]
  );

  return (
    <div>
      <Popover content={title}>
        <Switch
          checked={active}
          onChange={onChange}
          disabled={mutation.isLoading}
        />
      </Popover>
    </div>
  );
};

export default ToggleRule;
