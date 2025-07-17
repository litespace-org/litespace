import Form from "@/components/Auth/Register/Form";
import Title from "@/components/Auth/Common/Title";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { IUser } from "@litespace/types";

type Role = "student" | "tutor";

const Content: React.FC = () => {
  const navigate = useNavigate();

  const params = useParams<{ role: Role }>();
  const role = useMemo(() => {
    if (params.role === "student") return IUser.Role.Student;
    if (params.role === "tutor") return IUser.Role.Tutor;
    return undefined;
  }, [params.role]);

  useEffect(() => {
    if (!role) return navigate(Web.Root);
  }, [navigate, role]);

  return (
    <main className="flex flex-col gap-10 sm:gap-0 items-center w-full max-w-[392px] p-6">
      <div className="flex-1 flex flex-col justify-center gap-8 w-full">
        <Title type="register" role={role} />
        <Form role={role} />
      </div>
    </main>
  );
};

export default Content;
