import axios from "axios";

type BriefReacherRes = {
  // https://docs.reacher.email/getting-started/is-reachable
  is_reachable: "safe" | "invalid" | "risky" | "unknown";
  mx: {
    accepts_mail: boolean;
  };
  syntax: {
    is_valid_syntax: boolean;
  };
  smtp: {
    can_connect_smtp: boolean;
  };
};

export async function isEmailValid(email: string): Promise<boolean> {
  const res = await axios.post("http://127.0.0.1:4009/v1/check_email", {
    to_email: email,
  });
  const data: BriefReacherRes = res.data;

  return (
    data.is_reachable === "safe" &&
    data.mx.accepts_mail &&
    data.syntax.is_valid_syntax &&
    data.smtp.can_connect_smtp
  );
}
