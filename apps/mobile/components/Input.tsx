import React, { useRef, forwardRef } from "react";
import {
  Pressable,
  TextInput,
  View,
  TextInputProps,
  Text,
  ViewProps,
} from "react-native";
import cn from "classnames";

export type InputType = "password" | "text";

export type InputAction = {
  id: number;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export type InputSize = "small" | "medium" | "large";

export type ExtraInputProps = {
  idleDir?: "rtl" | "ltr";
  type?: InputType;
  inputSize?: InputSize;
  icon?: React.ReactNode;
  endAction?: InputAction;
  state?: "error" | "success";
  label?: string;
  helper?: string;
  pre?: React.ReactNode;
  post?: React.ReactNode;
  disabled?: boolean;
};

export type InputProps = TextInputProps &
  ExtraInputProps & { containerStyle?: ViewProps["style"] };

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      type,
      state,
      label,
      value,
      disabled,
      helper,
      inputSize = "large",
      idleDir = "rtl",
      icon,
      endAction,
      className,
      pre,
      post,
      style,
      containerStyle,
      ...props
    },
    ref
  ) => {
    const inputInternalRef = useRef<TextInput | null>(null);

    const heightClass =
      inputSize === "small" ? "h-7" : inputSize === "medium" ? "h-8" : "h-10";

    const borderBgClasses = cn(
      "rounded-[6px] border w-full px-3 flex flex-row items-center gap-2",
      heightClass,
      {
        "border-natural-300 bg-natural-50": !state && !disabled,
        "border-destructive-600 bg-natural-50": state === "error",
        "border-success-600 bg-natural-50": state === "success",
        "bg-natural-100 border-natural-200": disabled,
      }
    );

    const iconWrapper = cn(
      "w-4 h-4",
      !disabled && "group-focus-within:[&_*]:stroke-natural-950",
      value ? "[&_*]:stroke-natural-950" : "[&_*]:stroke-natural-600",
      disabled && "[&_*]:stroke-natural-500"
    );

    const placeholderTextColor = disabled
      ? "rgb(163,163,163)"
      : "rgb(82,82,82)";

    const textAlign = !value
      ? idleDir === "rtl"
        ? "right"
        : "left"
      : undefined;

    return (
      <View
        className={cn(
          "flex flex-col gap-1 w-full group",
          disabled && "cursor-not-allowed"
        )}
        style={containerStyle}
      >
        {label ? (
          <Text
            accessibilityRole="text"
            className={cn("text-caption font-semibold", {
              "text-natural-950": !disabled,
              "text-natural-500": disabled,
            })}
          >
            {label}
          </Text>
        ) : null}

        <View className="flex flex-row items-center">
          {pre}
          <Pressable
            onPress={() => inputInternalRef.current?.focus()}
            disabled={disabled}
            className={cn(
              borderBgClasses,
              "focus-within:ring-1 focus-within:ring-brand-600 focus-within:border-brand-600"
            )}
          >
            {icon ? <View className={iconWrapper}>{icon}</View> : null}

            <TextInput
              ref={(input) => {
                if (typeof ref === "function") ref(input as TextInput);
                else if (ref)
                  (ref as React.MutableRefObject<TextInput | null>).current =
                    input;
                inputInternalRef.current = input;
              }}
              editable={!disabled}
              secureTextEntry={type === "password"}
              value={value as any}
              placeholderTextColor={placeholderTextColor}
              className={cn(
                "grow bg-inherit font-medium text-caption leading-[150%] h-full",
                "placeholder:text-natural-600",
                className
              )}
              style={[{ textAlign }, style]}
              {...props}
            />
            {endAction ? (
              <Pressable
                key={endAction.id}
                onPress={endAction.onClick}
                disabled={disabled}
                className={cn(
                  "flex items-center justify-center w-5 h-5 -mx-1 rounded-sm",
                  !disabled && "outline-none focus:ring-2 ring-brand-700",
                  !value && "[&_*]:stroke-natural-600",
                  value && !disabled && "[&_*]:stroke-natural-950",
                  disabled && "[&_*]:stroke-natural-500",
                  endAction.className
                )}
              >
                {endAction.icon}
              </Pressable>
            ) : null}
          </Pressable>
          {post}
        </View>

        {helper ? (
          <View className="flex">
            <Text
              className={cn("text-tiny font-semibold", {
                "text-natural-600": !state && !disabled,
                "text-success-600": state === "success",
                "text-destructive-600": state === "error",
              })}
            >
              {helper}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);
