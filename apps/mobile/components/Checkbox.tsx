import { Pressable, View, Text } from "react-native";
import React, { useState } from "react";
import cn from "classnames";

export const Checkbox: React.FC<{
  label?: React.ReactNode;
  onCheckedChange?: (value: boolean) => void;
  disabled?: boolean;
  checkBoxClassName?: string;
  containerClassName?: string;
}> = ({
  label,
  onCheckedChange,
  disabled,
  checkBoxClassName,
  containerClassName,
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <View
      className={cn(
        "flex flex-row items-center",
        disabled && "opacity-50",
        containerClassName
      )}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        onPress={() => {
          onCheckedChange?.(!checked);
          setChecked(!checked);
        }}
        disabled={disabled}
        className="rounded-full flex justify-center items-center"
      >
        <View
          className={cn(
            "border rounded-sm h-4 w-4 flex items-center justify-center",
            checked ? "bg-brand-500 border-brand-500" : "border-natural-500",
            checkBoxClassName
          )}
        >
          {checked ? <View className="w-2.5 h-2.5 bg-natural-50" /> : null}
        </View>
      </Pressable>
      {label ? (
        <Pressable
          onPress={() => {
            onCheckedChange?.(!checked);
            setChecked(!checked);
          }}
          disabled={disabled}
          className="ml-2 flex-1"
        >
          {typeof label === "string" ? (
            <Text className="font-cairo font-semibold pr-2 text-md leading-[150%] text-natural-600">
              {label}
            </Text>
          ) : (
            <View className="pr-2">{label}</View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
};
