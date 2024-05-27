import React from "react";

const Register = () => {
  return (
    <div>
      <h1>Register</h1>

      <div>
        <div className="flex flex-row gap-2">
          <label htmlFor="name" className="inline-block">
            Name
          </label>
          <input type="text" name="name" className="border" />
        </div>
        <div className="flex flex-row gap-2">
          <label htmlFor="email">Email</label>
          <input type="text" name="email" className="border" />
        </div>
        <div className="flex flex-row gap-2">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" className="border" />
        </div>
      </div>
    </div>
  );
};

export default Register;
