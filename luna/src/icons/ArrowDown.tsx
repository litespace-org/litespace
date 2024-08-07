import { SVGProps } from "react";
const ArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="#181B22"
      d="m8.125 9 3.88 3.88L15.885 9a.996.996 0 1 1 1.41 1.41L12.705 15a.996.996 0 0 1-1.41 0l-4.59-4.59a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0Z"
    />
  </svg>
);
export default ArrowDown;
