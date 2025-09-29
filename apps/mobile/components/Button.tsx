import React, { useMemo } from "react";
import { Pressable, View, Text, ActivityIndicator } from "react-native";
import type { GestureResponderEvent } from "react-native";
import type { Size } from "@litespace/types";

export type ButtonType = "main" | "warning" | "success" | "error" | "natural";
export type ButtonVariant = "primary" | "secondary" | "bold";

export type ButtonProps = {
  id?: string;
  children?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  onPress?: (event: GestureResponderEvent) => void;
  type?: ButtonType;
  size?: Size;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  htmlType?: "button" | "submit" | "reset";
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  tabIndex?: number;
  autoFocus?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  id,
  children,
  variant = "primary",
  type = "main",
  size = "small",
  onClick,
  onPress,
  disabled,
  className,
  loading,
  startIcon,
  endIcon,
}) => {
  const is = useMemo(
    () => ({
      primary: variant === "primary",
      secondary: variant === "secondary",
      bold: variant === "bold",

      main: type === "main",
      warning: type === "warning",
      error: type === "error",
      success: type === "success",
      natural: type === "natural",

      small: size === "small",
      medium: size === "medium",
      large: size === "large",
    }),
    [variant, type, size]
  );

  const backgroundClasses = [
    is.error && is.primary && "bg-destructive-700",
    is.error && is.secondary && "bg-natural-50",
    is.main && is.primary && "bg-brand-500",
    is.main && is.secondary && "bg-natural-50",
    is.success && is.primary && "bg-success-700",
    is.success && is.secondary && "bg-natural-50",
    is.warning && is.primary && "bg-warning-700",
    is.warning && is.secondary && "bg-natural-50",
    is.natural && is.primary && "bg-natural-100",
    is.natural && is.secondary && "bg-natural-50",
    is.natural && is.bold && "bg-natural-200",
  ]
    .filter(Boolean)
    .join(" ");

  const textColorClasses = [
    is.natural && "text-natural-700",
    is.primary && !is.natural && "text-natural-50",
    is.secondary && is.main && "text-brand-500",
    is.secondary && is.error && "text-destructive-700",
    is.secondary && is.success && "text-success-700",
    is.secondary && is.warning && "text-warning-700",
  ]
    .filter(Boolean)
    .join(" ");

  const sizeClasses = [
    is.small && "px-2 h-7",
    is.medium && "px-3 h-8",
    is.large && "px-4 h-10",
  ]
    .filter(Boolean)
    .join(" ");

  const borderClasses = [
    "border",
    is.main && is.primary && "border-button-main-default",
    is.error && is.primary && "border-destructive-700",
    is.success && is.primary && "border-success-500",
    is.warning && is.primary && "border-warning-700",
    is.natural && is.primary && "border-button-natural-default",
    is.main && is.secondary && "border-brand-500",
    is.error && is.secondary && "border-destructive-700",
    is.success && is.secondary && "border-success-500",
    is.warning && is.secondary && "border-warning-700",
    is.natural && is.secondary && "border-natural-100",
  ]
    .filter(Boolean)
    .join(" ");

  const containerClassName = [
    "relative",
    "flex items-center justify-center w-fit",
    "rounded-lg",
    "disabled:opacity-50",
    backgroundClasses,
    borderClasses,
    sizeClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (onPress) onPress(e);
    else if (onClick) onClick(e);
  };

  return (
    <Pressable
      accessibilityRole="button"
      className={containerClassName}
      disabled={disabled}
      onPress={handlePress}
      testID={id}
    >
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator
            size={is.small ? "small" : "large"}
            color={is.primary ? "#FFFFFF" : "#262627"}
          />
        </View>
      ) : null}
      <View
        className={[
          loading ? "opacity-0" : "opacity-100",
          "flex flex-row items-center justify-center gap-2",
        ].join(" ")}
      >
        {startIcon ? <View className="w-4 h-4">{startIcon}</View> : null}
        {typeof children === "string" ? (
          <Text
            className={[
              "font-medium",
              is.small ? "text-[14px]" : "text-[16px]",
              textColorClasses,
            ].join(" ")}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {endIcon ? <View className="w-4 h-4">{endIcon}</View> : null}
      </View>
    </Pressable>
  );
};
