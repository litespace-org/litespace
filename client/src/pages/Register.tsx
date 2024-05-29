import { Input } from "@/components/common/Input";
import { useRegister } from "@/hooks/register";
import React, { useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";

const Register: React.FC = () => {
  const { name, email, password, register } = useRegister();
  const methods = useForm();

  const onSubmit = useMemo(
    () =>
      methods.handleSubmit((data) => {
        console.log(data);
      }),
    [methods]
  );

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-4xl">Register</h1>
      </div>

      <FormProvider {...methods}>
        <form
          className="max-w-screen-md mx-auto flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Input
            type="text"
            label="Name"
            id="name"
            placeholder="Enter your name"
          />
          <Input
            type="text"
            label="Email"
            id="email"
            placeholder="Enter your email"
          />
          <Input
            type="password"
            label="Password"
            id="passowrd"
            placeholder="Enter your password"
          />
          <div>
            <button onClick={onSubmit}>
              {register.loading ? "loading..." : "Register"}
            </button>
            <p>{register.error}</p>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Register;
