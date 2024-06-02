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

async function token(token: string) {
  await client.get("/api/v1/auth/token", {
    params: { token },
  });
}

async function logout() {
  await client.get("/api/v1/auth/logout");
}

export default {
  password,
  logout,
  token,
};
