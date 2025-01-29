// import { useAppDispatch, useAppSelector } from "@/redux/store";
// import { register as registerUser } from "@/redux/user/register";
// import { useCallback, useState } from "react";

// export function useRegister() {
// const dispatch = useAppDispatch();
// const { loading, error } = useAppSelector((state) => state.user.register);
// const [name, setName] = useState<string>("");
// const [email, setEmail] = useState<string>("");
// const [password, setPassword] = useState<string>("");
// const register = useCallback(async () => {
//   if (!name || !email || !password) return;
//   await dispatch(registerUser({ name, email, password }));
// }, [dispatch, email, name, password]);
// return {
//   name: { value: name, set: setName },
//   email: { value: email, set: setEmail },
//   password: { value: password, set: setPassword },
//   register: {
//     call: register,
//     loading,
//     error,
//   },
// };
// }
