import { Input, Form } from "@litespace/components";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { register } from "@/redux/user/register";
import React, { useCallback } from "react";
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
  // const methods = useForm<IFormInput>();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.user.register);

  const onSubmit: SubmitHandler<IFormInput> = useCallback(
    async (data) => {
      await dispatch(register(data));
    },
    [dispatch]
  );

  return (
    <div className="max-w-screen-md mx-auto my-10">
      <div className="mb-4">
        <h1 className="text-4xl text-center">Register</h1>
      </div>

      <Form<IFormInput> onSubmit={onSubmit}>
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
          id="password"
          placeholder="Enter your password"
          validation={valiedation.password}
        />
        <button type="submit">{loading ? "Loading..." : "Register"}</button>

        {error && <p>{error}</p>}
      </Form>
    </div>
  );
};

export default Register;
