import LiteSpace from "@/icons/logo.svg";
import TutorLight from "@/icons/tutor-light.svg";
import TutorDark from "@/icons/tutor-dark.svg";
import StudentLight from "@/icons/student-light.svg";
import StudentDark from "@/icons/student-dark.svg";

export type SVG = React.FC<React.SVGProps<SVGSVGElement>>;

const icons = {
  LiteSpace,
  TutorLight,
  TutorDark,
  StudentLight,
  StudentDark,
} as const satisfies Record<string, SVG>;

export default icons;
