import { SVGProps } from "react";

const Coin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 9.5c0 2.485-4.03 4.5-9 4.5m9-4.5C21 7.015 16.97 5 12 5S3 7.015 3 9.5m18 0V15c0 2.21-4.03 4-9 4m0-5c-4.97 0-9-2.015-9-4.5m9 4.5v5M3 9.5V15c0 2.21 4.03 4 9 4m-5-.674v-5.084m10 5.084v-5.084"
    />
  </svg>
);
export default Coin;
