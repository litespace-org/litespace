import { useRegister } from "@/hooks/register";
import React from "react";

const Register: React.FC = () => {
  const { name, email, password, register } = useRegister();

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-4xl">Register</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-row gap-2">
          <label htmlFor="name" className="inline-block">
            Name
          </label>
          <input
            type="text"
            name="name"
            className="border"
            value={name.value}
            onChange={(e) => name.set(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            autoComplete="username"
            className="border"
            value={email.value}
            onChange={(e) => email.set(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            className="border"
            autoComplete="current-password"
            value={password.value}
            onChange={(e) => password.set(e.target.value)}
          />
        </div>

        <div>
          <button onClick={() => register.call()}>
            {register.loading ? "loading..." : "Register"}
          </button>
          <p>{register.error}</p>
        </div>
      </form>
    </div>
  );
};

export default Register;
