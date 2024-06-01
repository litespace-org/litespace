import { client } from "@/api/axios";

async function password({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await client.get("/api/v1/auth/password", {
    params: {
      email,
      password,
    },
  });
}

async function logout() {
  await client.get("/api/v1/auth/logout");
}

export default {
  password,
  logout,
};
