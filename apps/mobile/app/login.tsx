import { ThemedView } from "@/components/ThemedView";
import React, { useMemo } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";

type IForm = {
  email: string;
  password: string;
};

const Login = () => {
  const { control, handleSubmit } = useForm<IForm>();

  const onSubmit = useMemo(
    () =>
      handleSubmit((data) => {
        console.log(data);
      }),
    []
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
