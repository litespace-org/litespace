/// <reference types="vite/client" />
/// <reference types="webrtc" />
/// <reference types="redux-persist" />

declare module "@litespace/assets/*.svg" {
  import { SVGProps } from "react";
  declare const SVG: (props: SVGProps<SVGSVGElement>) => React.ReactNode;
  export default SVG;
}

enum BackendModes {
  "local" = "local",
  "staging" = "staging",
  "production" = "production",
}

interface ImportMetaEnv {
  readonly VITE_BACKEND: BackendModes;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
