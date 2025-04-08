import { Landing } from "@litespace/utils/routes";
import { redirect } from "next/navigation";

export default async function Page() {
  return redirect(Landing.Home);
}
