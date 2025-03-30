import { schema, Props } from "@/composition/Session";

declare const __SESSION_COMPOSITION_PROPS__: Props;

export const sessionCompositionProps = schema.parse(
  __SESSION_COMPOSITION_PROPS__
);
