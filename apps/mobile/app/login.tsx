import { ThemedView } from "@/components/ThemedView";
import React, { useMemo } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { OnError, OnLoginSuccess, useLogin } from "@litespace/headless/login";
import AsyncStorage from "@react-native-async-storage/async-storage";

type IForm = {
  email: string;
  password: string;
};

const Login = () => {
  const { control, handleSubmit } = useForm<IForm>();

  const payload: { onSuccess: OnLoginSuccess; onError: OnError } = useMemo(
    () => ({
      onSuccess: (user) => {
        AsyncStorage.setItem("token", user.token);
        console.log(user);
      },
      onError: (error) => {
        console.log(error.message);
      },
    }),
    []
  );

  const login = useLogin(payload);

  const onSubmit = useMemo(
    () =>
      handleSubmit((data) => {
        login.mutate(data);
      }),
    [handleSubmit, login]
  );

  return (
    <ThemedView style={styles.container}>
      <View>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Email"
            />
          )}
          name="email"
          rules={{ required: true }}
          defaultValue=""
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholder="Password"
            />
          )}
          name="password"
          rules={{ required: true }}
          defaultValue=""
        />
        <Button title="Login" onPress={onSubmit} />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    padding: 30,
  },
});

export default Login;
