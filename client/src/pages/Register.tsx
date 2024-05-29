import { Input } from "@/components/common/Input";
import { useRegister } from "@/hooks/register";
import React, { useCallback, useMemo } from "react";
import {
  useForm,
  FormProvider,
  FieldValues,
  RegisterOptions,
  SubmitHandler,
} from "react-hook-form";

interface IFormInput {
  name: string;
  email: string;
  password: string;
}

const valiedation: Record<
  "name" | "email" | "password",
  RegisterOptions<FieldValues>
> = {
  name: {
    required: { value: true, message: "Requried" },
    minLength: {
      value: 3,
      message: "Three characters are the minimum length for a name.",
    },
    maxLength: {
      value: 50,
      message: "50 characters are the maximum length for a name.",
    },
  },
  email: {
    required: { value: true, message: "Requried" },
    pattern: {
      value: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
      message: "Invalid email",
    },
  },
  password: {
    required: { value: true, message: "Requried" },
    pattern: {
      value: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
      message: "Invlaid password",
    },
  },
} as const;

const Register: React.FC = () => {
  const { name, email, password, register } = useRegister();
  const methods = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = useCallback((data) => {
    console.log(data);
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-4xl">Register</h1>
      </div>

      <FormProvider {...methods}>
        <form
          className="max-w-screen-md mx-auto flex flex-col gap-2"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <Input
            type="text"
            label="Name"
            id="name"
            placeholder="Enter your name"
            validation={valiedation.name}
          />
          <Input
            type="text"
            label="Email"
            id="email"
            placeholder="Enter your email"
            validation={valiedation.email}
          />
          <Input
            type="password"
            label="Password"
            id="passowrd"
            placeholder="Enter your password"
            validation={valiedation.password}
          />
          <button type="submit">Click</button>
        </form>
      </FormProvider>
    </div>
  );
};

export default Register;
