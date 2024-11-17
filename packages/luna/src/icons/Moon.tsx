import React from "react";

const Moon = () => {
  return (
    <svg
      className="tw-translate-x-2"
      width="93"
      height="93"
      viewBox="0 0 93 93"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_dii_525_10298)">
        <rect
          width="53.6474"
          height="53.6474"
          rx="26.8237"
          transform="matrix(-1 3.99602e-09 3.99602e-09 1 77.1001 19.7028)"
          fill="#DEE5F3"
        />
      </g>
      <path
        opacity="0.9"
        d="M49.5898 22.9278C38.7085 20.3261 27.7563 26.9513 25.0095 37.797L24.8965 38.2435C22.1132 49.2332 28.8818 60.3698 39.9186 62.9602C50.9903 65.5587 62.129 58.6304 64.7276 47.5586C67.3007 36.5953 60.5423 25.5466 49.5898 22.9278Z"
        fill="#1F2533"
        fill-opacity="0.79"
      />
      <defs>
        <filter
          id="filter0_dii_525_10298"
          x="0.0526347"
          y="0.202757"
          width="92.6475"
          height="92.6473"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-3.9" />
          <feGaussianBlur stdDeviation="9.75" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.717122 0 0 0 0 0.717122 0 0 0 0 0.717122 0 0 0 0.31 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_525_10298"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_525_10298"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.6" />
          <feGaussianBlur stdDeviation="2.6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.747882 0 0 0 0 0.749977 0 0 0 0 0.754167 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_525_10298"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2.6" />
          <feGaussianBlur stdDeviation="2.6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_525_10298"
            result="effect3_innerShadow_525_10298"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default Moon;
