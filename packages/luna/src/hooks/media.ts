import { useMediaQuery } from "react-responsive";

export function useMediaQueries() {
  const sm = useMediaQuery({ query: "(min-width: 640px)" });
  const md = useMediaQuery({ query: "(min-width: 768px)" });
  const lg = useMediaQuery({ query: "(min-width: 1024px)" });
  const xl = useMediaQuery({ query: "(min-width: 1280px)" });
  const xxl = useMediaQuery({ query: "(min-width: 1536px)" });
  return { sm, md, lg, xl, xxl };
}
