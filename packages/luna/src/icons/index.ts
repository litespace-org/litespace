import LiteSpace from "@/icons/logo.svg";
import TutorMaleLight from "@/icons/tutor-male-light.svg";
import TutorMaleDark from "@/icons/tutor-male-dark.svg";
import TutorFemaleLight from "@/icons/tutor-female-light.svg";
import TutorFemaleDark from "@/icons/tutor-female-dark.svg";
import StudentMaleLight from "@/icons/student-male-light.svg";
import StudentMaleDark from "@/icons/student-male-dark.svg";
import StudentFemaleLight from "@/icons/student-female-light.svg";
import StudentFemaleDark from "@/icons/student-female-dark.svg";
import RegisterLight from "@/icons/register-light.svg";
import RegisterDark from "@/icons/register-dark.svg";
import LoginLight from "@/icons/login-light.svg";
import LoginDark from "@/icons/login-dark.svg";

export type SVG = React.FC<React.SVGProps<SVGSVGElement>>;

const icons = {
  LiteSpace,
  TutorMaleLight,
  TutorMaleDark,
  TutorFemaleLight,
  TutorFemaleDark,
  StudentFemaleLight,
  StudentFemaleDark,
  StudentMaleLight,
  StudentMaleDark,
  RegisterLight,
  RegisterDark,
  LoginLight,
  LoginDark,
} as const satisfies Record<string, SVG>;

export default icons;
