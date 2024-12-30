import { Props } from "@/components/Schedule/types";
import dayjs from "@/lib/dayjs";
import AddCircle from "@litespace/assets/AddCircle";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import Close from "@litespace/assets/Close";
import { Button, ButtonVariant } from "@litespace/luna/Button";
import { Checkbox } from "@litespace/luna/Checkbox";
import { Dialog } from "@litespace/luna/Dialog";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { Select } from "@litespace/luna/Select";
import { Typography } from "@litespace/luna/Typography";
import { range } from "lodash";
import React, { useCallback, useMemo, useState } from "react";

const ManageSchedule: React.FC<Props> = ({
  start,
  open,
  loading,
  error,
  slots,
  onClose,
}) => {
  const intl = useFormatMessage();

  const [startTime, setStartTime] = useState(start);

  const [fromValue, setFromValue] = useState<
    Array<{ id: number; value: string }>
  >(() => {
    return range(7).map((_, idx) => ({ id: idx, value: "" }));
  });

  const [toValue, setToValue] = useState<Array<{ id: number; value: string }>>(
    () => {
      return range(7).map((_, idx) => ({ id: idx, value: "" }));
    }
  );

  const [daysOfWeek, setDaysOfWeek] = useState(() =>
    range(7).map((_, idx) => ({
      id: idx,
      checked: false,
      value: dayjs(startTime).add(idx, "day"),
    }))
  );

  const fromOptions = useMemo(
    () => (id: number) => {
      // TODO: 11:30 pm
      const startOfDay = dayjs(startTime).add(id, "day");
      const endValue = toValue[id].value?.length
        ? dayjs(toValue[id].value)
        : dayjs(startTime).add(id, "day").endOf("day");
      const optionsNum = Math.floor(
        dayjs(endValue).diff(startOfDay, "minute") / 30
      );

      return range(optionsNum).map((_, index) => {
        return {
          label: dayjs(startOfDay)
            .add(index * 30, "minutes")
            .format("hh:mm a"),
          value: dayjs(startOfDay)
            .add(index * 30, "minutes")
            .toISOString(),
        };
      });
    },
    [startTime, toValue]
  );

  const toOptions = useMemo(
    () => (id: number) => {
      const startValue = fromValue[id].value?.length
        ? dayjs(fromValue[id].value)
        : dayjs(startTime).add(id, "day").startOf("day");
      const endOfDay = dayjs(startTime).add(id, "day").endOf("day");
      const optionsNum =
        Math.floor(dayjs(endOfDay).diff(startValue, "minute") / 30) + 2;

      return range(optionsNum).map((_, index) => {
        return {
          label: dayjs(startValue)
            .add(index * 30, "minutes")
            .format("hh:mm a"),
          value: dayjs(startValue)
            .add(index * 30, "minutes")
            .toISOString(),
        };
      });
    },
    [daysOfWeek, startTime, fromValue]
  );

  const moveWeekBefore = useCallback(() => {
    setStartTime((prev) => dayjs(prev).subtract(1, "week").toISOString());
  }, []);

  const moveWeekAfter = useCallback(() => {
    setStartTime((prev) => dayjs(prev).add(1, "week").toISOString());
  }, []);

  const isSlotMatchDay = useMemo(
    () => (lessonStart: string | null, dayId: number) => {
      return (
        dayjs(lessonStart).isAfter(dayjs(daysOfWeek[dayId].value)) &&
        dayjs(lessonStart).isBefore(
          dayjs(daysOfWeek[dayId].value).add(24, "hours")
        )
      );
    },
    [daysOfWeek]
  );

  // loading
  if (loading) return <Loader text={intl("tutors.schedule.loading.message")} />;
  // error
  if (error)
    return (
      <LoadingError
        error={intl("tutors.schedule.error.message")}
        retry={() => {
          // TODO:
          "retry";
        }}
      />
    );
  return (
    <Dialog
      close={onClose}
      title={intl("tutors.schedule.manage")}
      open={open}
      className="rounded-[32px] min-w-[597px] py-6 bg-natural-50"
    >
      <div className="my-6 flex justify-center items-center gap-4">
        <ArrowRight
          className="[&>*]:stroke-brand-700 hover:cursor-pointer"
          onClick={moveWeekBefore}
        />
        <Typography element="body" weight="bold" className="text-natural-950">
          {dayjs(startTime).format("D MMMM")}
          {" - "}
          {dayjs(startTime).add(6, "day").format("D MMMM")}
        </Typography>
        <ArrowLeft
          className="[&>*]:stroke-brand-700 hover:cursor-pointer"
          onClick={moveWeekAfter}
        />
      </div>
      <div>
        <Typography
          element="body"
          weight="bold"
          className="text-natural-950 mb-4"
        >
          {intl("tutors.schedule.available-days")}
        </Typography>
        <div className="flex flex-col gap-8 mb-10">
          {daysOfWeek.map((_, idx) => (
            <div key={idx}>
              <div className="flex items-center ps-2">
                <div className="me-8 min-w-32">
                  <Checkbox
                    checked={daysOfWeek[idx].checked}
                    onCheckedChange={() => {
                      setDaysOfWeek((prev) => {
                        return prev.map((day) => {
                          if (day.id === idx)
                            return {
                              ...day,
                              checked: !day.checked,
                            };
                          else return { ...day };
                        });
                      });
                    }}
                    label={
                      <Typography
                        element="caption"
                        weight="medium"
                        className="text-natural-950"
                      >
                        {dayjs(startTime).add(idx, "day").format("dddd D/M")}
                      </Typography>
                    }
                  />
                </div>
                <div className="text-center grow">
                  {/* tested */}
                  {!slots.length && !daysOfWeek[idx].checked ? (
                    <Typography
                      element="caption"
                      weight="medium"
                      className="text-natural-500"
                    >
                      {intl("labels.empty")}
                    </Typography>
                  ) : null}

                  {/* tested */}
                  {!slots.length && daysOfWeek[idx].checked ? (
                    <div className="flex items-center gap-4">
                      <Select
                        options={fromOptions(idx)}
                        placeholder={intl("placeholders.from")}
                        hasIcon={false}
                        onChange={(value) => {
                          setFromValue((prev) => {
                            return prev.map((val) => {
                              if (val.id === idx) return { ...val, value };
                              return { ...val };
                            });
                          });
                        }}
                        value={fromValue[idx].value}
                      />

                      <Typography
                        element="body"
                        weight="bold"
                        className="text-natural-500"
                      >
                        -
                      </Typography>

                      <Select
                        options={toOptions(idx)}
                        placeholder={intl("placeholders.to")}
                        hasIcon={false}
                        onChange={(value) => {
                          setToValue((prev) => {
                            return prev.map((val) => {
                              if (val.id === idx) return { ...val, value };
                              return { ...val };
                            });
                          });
                        }}
                        value={toValue[idx].value}
                      />
                      <div className="hover:cursor-pointer">
                        <Close />
                      </div>
                      <div className="ms-10 hover:cursor-pointer">
                        <AddCircle width={24} height={24} />
                      </div>
                    </div>
                  ) : null}

                  {slots.map((slot, index) => {
                    // unchecked and matched
                    if (
                      !daysOfWeek[idx].checked &&
                      isSlotMatchDay(slot.start, idx)
                    )
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <Select
                            options={fromOptions(idx)}
                            placeholder={dayjs(slot.start).format("hh:mm a")}
                            hasIcon={false}
                            onChange={(value) => {
                              setFromValue((prev) => {
                                return prev.map((val) => {
                                  if (val.id === idx) return { ...val, value };
                                  return { ...val };
                                });
                              });
                            }}
                            value={
                              fromValue[idx].value.length
                                ? fromValue[idx].value
                                : dayjs(slot.start).toISOString()
                            }
                          />
                          <Typography
                            element="body"
                            weight="bold"
                            className="text-natural-500"
                          >
                            -
                          </Typography>
                          <Select
                            options={toOptions(idx)}
                            hasIcon={false}
                            // there is a propblem with this placeholder
                            placeholder={dayjs(slot.end).format("hh:mm a")}
                            onChange={(value) => {
                              setToValue((prev) => {
                                return prev.map((val) => {
                                  if (val.id === idx) return { ...val, value };
                                  return { ...val };
                                });
                              });
                            }}
                            value={
                              toValue[idx].value.length
                                ? toValue[idx].value
                                : dayjs(slot.end).toISOString()
                            }
                          />
                          <div className="hover:cursor-pointer">
                            <Close />
                          </div>
                          <div className="ms-10 hover:cursor-pointer">
                            <AddCircle width={24} height={24} />
                          </div>
                        </div>
                      );

                    // tested
                    if (
                      !daysOfWeek[idx].checked &&
                      !isSlotMatchDay(slot.start, idx)
                    )
                      return (
                        <Typography
                          key={index}
                          element="caption"
                          weight="medium"
                          className="text-natural-500"
                        >
                          {intl("labels.empty")}
                        </Typography>
                      );

                    // tested
                    if (
                      daysOfWeek[idx].checked &&
                      !isSlotMatchDay(slot.start, idx)
                    )
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <Select
                            options={fromOptions(idx)}
                            placeholder={intl("placeholders.from")}
                            hasIcon={false}
                            onChange={(value) => {
                              setFromValue((prev) => {
                                return prev.map((val) => {
                                  if (val.id === idx) return { ...val, value };
                                  return { ...val };
                                });
                              });
                            }}
                            value={
                              fromValue[idx].value.length
                                ? fromValue[idx].value
                                : ""
                            }
                          />

                          <Typography
                            element="body"
                            weight="bold"
                            className="text-natural-500"
                          >
                            -
                          </Typography>

                          <Select
                            options={toOptions(idx)}
                            placeholder={intl("placeholders.to")}
                            hasIcon={false}
                            onChange={(value) => {
                              setToValue((prev) => {
                                return prev.map((val) => {
                                  if (val.id === idx) return { ...val, value };
                                  return { ...val };
                                });
                              });
                            }}
                            value={
                              toValue[idx].value.length
                                ? toValue[idx].value
                                : ""
                            }
                          />
                          <div className="hover:cursor-pointer">
                            <Close />
                          </div>
                          <div className="ms-10 hover:cursor-pointer">
                            <AddCircle width={24} height={24} />
                          </div>
                        </div>
                      );

                    if (
                      daysOfWeek[idx].checked &&
                      isSlotMatchDay(slot.start, idx)
                    )
                      return (
                        <div key={index} className="flex flex-col gap-1">
                          <div className="flex items-center gap-4">
                            <Select
                              options={fromOptions(idx)}
                              placeholder={dayjs(slot.start).format("hh:mm a")}
                              hasIcon={false}
                              onChange={(value) => {
                                setFromValue((prev) => {
                                  return prev.map((val) => {
                                    if (val.id === idx)
                                      return { ...val, value };
                                    return { ...val };
                                  });
                                });
                              }}
                              value={
                                fromValue[idx].value.length
                                  ? fromValue[idx].value
                                  : dayjs(slot.start).toISOString()
                              }
                            />

                            <Typography
                              element="body"
                              weight="bold"
                              className="text-natural-500"
                            >
                              -
                            </Typography>

                            <Select
                              options={toOptions(idx)}
                              placeholder={dayjs(slot.end).format("hh:mm a")}
                              hasIcon={false}
                              onChange={(value) => {
                                setToValue((prev) => {
                                  return prev.map((val) => {
                                    if (val.id === idx)
                                      return { ...val, value };
                                    return { ...val };
                                  });
                                });
                              }}
                              value={
                                toValue[idx].value.length
                                  ? toValue[idx].value
                                  : dayjs(slot.end).toISOString()
                              }
                            />
                            <div className="hover:cursor-pointer">
                              <Close />
                            </div>
                            <div className="ms-10 hover:cursor-pointer">
                              <AddCircle width={24} height={24} />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Select
                              options={fromOptions(idx)}
                              placeholder={intl("placeholders.from")}
                              hasIcon={false}
                              onChange={(value) => {
                                setFromValue((prev) => {
                                  return prev.map((val) => {
                                    if (val.id === idx)
                                      return { ...val, value };
                                    return { ...val };
                                  });
                                });
                              }}
                              value={
                                fromValue[idx].value.length
                                  ? fromValue[idx].value
                                  : ""
                              }
                            />

                            <Typography
                              element="body"
                              weight="bold"
                              className="text-natural-500"
                            >
                              -
                            </Typography>

                            <Select
                              options={toOptions(idx)}
                              placeholder={intl("placeholders.to")}
                              hasIcon={false}
                              onChange={(value) => {
                                setToValue((prev) => {
                                  return prev.map((val) => {
                                    if (val.id === idx)
                                      return { ...val, value };
                                    return { ...val };
                                  });
                                });
                              }}
                              value={
                                toValue[idx].value.length
                                  ? toValue[idx].value
                                  : ""
                              }
                            />
                            <div className="hover:cursor-pointer">
                              <Close />
                            </div>
                            <div className="ms-10 hover:cursor-pointer">
                              <AddCircle width={24} height={24} />
                            </div>
                          </div>
                        </div>
                      );
                  })}

                  {/* { 


                    // ? slots.map((slot) => {
                        // if (

                          // dayjs(slot.start).isBetween(
                          //   dayjs(daysOfWeek[idx].value),
                          //   dayjs(daysOfWeek[idx + 1].value),
                          //   "hours",
                          //   "[)"
                          // )
                        ) {
                          return (
                            <div
                              key={slot.id}
                              className="flex items-center gap-4"
                            >
                              <Select
                                options={fromOptions(idx)}
                                placeholder={intl("placeholders.from")}
                                hasIcon={false}
                                onChange={(value) => {
                                  setFromValue((prev) => {
                                    return prev.map((val) => {
                                      if (val.id === idx)
                                        return { ...val, value };
                                      return { ...val };
                                    });
                                  });
                                }}
                                value={dayjs(slot.start).toISOString()}
                              />

                              <Typography
                                element="body"
                                weight="bold"
                                className="text-natural-500"
                              >
                                -
                              </Typography>

                              <Select
                                options={toOptions(idx)}
                                placeholder={intl("placeholders.to")}
                                hasIcon={false}
                                onChange={(value) => {
                                  setToValue((prev) => {
                                    return prev.map((val) => {
                                      if (val.id === idx)
                                        return { ...val, value };
                                      return { ...val };
                                    });
                                  });
                                }}
                                value={dayjs(slot.end).toISOString()}
                              />
                              <div className="hover:cursor-pointer">
                                <Close />
                              </div>
                              <div className="ms-10 hover:cursor-pointer">
                                <AddCircle width={24} height={24} />
                              </div>
                            </div>
                          );
                        }
                      })
                    : null}

                  {/* {daysOfWeek[idx].checked && !slots.length ? (
                    <div className="flex items-center gap-4">
                      <Select
                        options={fromOptions(idx)}
                        placeholder={intl("placeholders.from")}
                        hasIcon={false}
                        onChange={(value) => {
                          setFromValue((prev) => {
                            return prev.map((val) => {
                              if (val.id === idx) return { ...val, value };
                              return { ...val };
                            });
                          });
                        }}
                        value={fromValue[idx].value}
                      />

                      <Typography
                        element="body"
                        weight="bold"
                        className="text-natural-500"
                      >
                        -
                      </Typography>

                      <Select
                        options={toOptions(idx)}
                        placeholder={intl("placeholders.to")}
                        hasIcon={false}
                        onChange={(value) => {
                          setToValue((prev) => {
                            return prev.map((val) => {
                              if (val.id === idx) return { ...val, value };
                              return { ...val };
                            });
                          });
                        }}
                        value={toValue[idx].value}
                      />
                      <div className="hover:cursor-pointer">
                        <Close />
                      </div>
                      <div className="ms-10 hover:cursor-pointer">
                        <AddCircle width={24} height={24} />
                      </div>
                    </div>
                  ) : null} */}

                  {/* {!daysOfWeek[idx].checked ? (
                    <Typography
                      element="caption"
                      weight="medium"
                      className="text-natural-500"
                    >
                      {intl("labels.empty")}
                    </Typography>
                  ) : null} */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-6">
        <Button className="grow basis-1/2">
          <Typography
            element="body"
            weight="semibold"
            className="text-natural-50"
          >
            {intl("tutors.schedule.buttons.save")}
          </Typography>
        </Button>
        <Button variant={ButtonVariant.Secondary} className="grow basis-1/2">
          <Typography
            element="body"
            weight="semibold"
            className="text-brand-700"
          >
            {intl("labels.cancel")}
          </Typography>
        </Button>
      </div>
    </Dialog>
  );
};

export default ManageSchedule;

// const EmptyRow = () => {
//   return (

//   )
// }

// const options = useMemo(
//   () => (idx: number) => {
//     if (!daysOfWeek[idx].checked) return;

//     return range(48).map((_, index) => {
//       return {
//         label: dayjs(start)
//           .add(idx, "day")
//           .add(index * 30, "minutes")
//           .format("hh:mm a"),
//         value: dayjs(start)
//           .add(idx, "day")
//           .add(index * 30, "minutes")
//           .toISOString(),
//       };
//     });
//     return [];
//   },
//   [daysOfWeek, start]
// );

{
  /* 
          { daysOfWeek[idx].checked ? (
                    <div className="flex items-center gap-4">
                      {
                        slots.length ? slots.map((slot) => {
                          if (dayjs(slot.start).isAfter(dayjs(daysOfWeek[idx].value)) && dayjs(dayjs(slot.start).diff(dayjs(daysOfWeek[idx].value))).get("hours") < 24)
                            return (
                              <>
                                
                              </>
                            )
                        }) :  
                      }
                      <Select
                        options={fromOptions(idx)}
                        placeholder={intl("placeholders.from")}
                        hasIcon={false}
                        onChange={(value) => {
                          setFromValue((prev) => {
                            return prev.map((val) => {
                              if (val.id === idx) return { ...val, value };
                              return { ...val };
                            });
                          });
                        }}
                        value={fromValue[idx].value}
                      />

                      <Typography
                        element="body"
                        weight="bold"
                        className="text-natural-500"
                      >
                        -
                      </Typography>

                      <Select
                        options={toOptions(idx)}
                        placeholder={intl("placeholders.to")}
                        hasIcon={false}
                        onChange={(value) => {
                          setToValue((prev) => {
                            return prev.map((val) => {
                              if (val.id === idx) return { ...val, value };
                              return { ...val };
                            });
                          });
                        }}
                        value={toValue[idx].value}
                      />
                      <div className="hover:cursor-pointer">
                        <Close />
                      </div>
                      <div className="ms-10 hover:cursor-pointer">
                        <AddCircle width={24} height={24} />
                      </div>
                    </div>
                  ) : (
                    <Typography
                      element="caption"
                      weight="medium"
                      className="text-natural-500"
                    >
                      {intl("labels.empty")}
                    </Typography>
                  )}
          
          
          
          
          
          
          {range(7).map((_, idx) => {
            return (
              <div key={idx}>
                <div className="flex items-center ps-2">
                  <div className="me-8 min-w-32">
                    <Checkbox
                      label={
                        <Typography
                          element="caption"
                          weight="medium"
                          className="text-natural-950"
                        >
                          {dayjs(start).add(idx, "day").format("dddd D/M")}
                        </Typography>
                      }
                    />
                  </div>
                  <div className="text-center grow">
                    {slots.length ? (
                      <div className="flex items-center gap-4">
                        <Select
                          options={
                            //   slots.forEach((slot) => {
                            //   return dayjs(slot.start).isBetween(
                            //     dayjs(start).add(idx, "day"),
                            //     dayjs(start).add(idx + 1, "day")
                            //   )
                            //     ? { label: slot.start, value: slot.start }
                            //     : null;
                            // })
                            slots.map((slot) => {
                              if (!slot.start || !slot.end) return;
                              if (
                                dayjs(slot.start).isBetween(
                                  dayjs(start).add(idx, "day"),
                                  dayjs(start).add(idx + 1, "day")
                                )
                              )
                                return { label: slot.start, value: slot.start };
                            })
                          }
                          placeholder={intl("placeholders.from")}
                          hasIcon={false}
                        />
                        <Typography
                          element="body"
                          weight="bold"
                          className="text-natural-500"
                        >
                          -
                        </Typography>
                        <Select
                          options={[]}
                          placeholder={intl("placeholders.to")}
                          hasIcon={false}
                        />
                        <div className="hover:cursor-pointer">
                          <Close />
                        </div>
                        <div className="ms-10 hover:cursor-pointer">
                          <AddCircle width={24} height={24} />
                        </div>
                      </div>
                    ) : (
                      <Typography
                        element="caption"
                        weight="medium"
                        className="text-natural-500"
                      >
                        {intl("labels.empty")}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            );
          })} */
}
