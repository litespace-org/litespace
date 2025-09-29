import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Animated } from "react-native";
import cn from "classnames";
import type { Size } from "@litespace/types";

export type SwitchProps = {
  id?: string;
  size?: Size;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export const Switch: React.FC<SwitchProps> = ({
  id,
  size = "small",
  onChange,
  disabled,
}) => {
  const dims = useMemo(
    () =>
      size === "large"
        ? { h: 10, w: 88, thumb: 9 }
        : size === "medium"
          ? { h: 8, w: 80, thumb: 7 }
          : { h: 7, w: 65, thumb: 6 },
    [size]
  );

  const [checked, setChecked] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: checked ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [checked, anim]);

  const padding = dims.w / 1.35;
  const trackWidth = dims.w;
  const thumbSize = dims.thumb * 4;
  const xOn = trackWidth - padding;
  const xOff = -dims.w / 3.75;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [xOff, xOn],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      testID={id}
      disabled={disabled}
      onPress={() => {
        onChange?.(!checked);
        setChecked(!checked);
      }}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        "transition-colors disabled:opacity-50",
        checked ? "bg-brand-500" : "bg-natural-400"
      )}
      style={{ height: dims.h * 4, width: trackWidth }}
    >
      <Animated.View
        className={cn("rounded-full shadow-switch-thumb bg-natural-50")}
        style={{
          height: thumbSize,
          width: thumbSize,
          transform: [{ translateX }, { translateY: 2 }],
        }}
      />
    </Pressable>
  );
};
