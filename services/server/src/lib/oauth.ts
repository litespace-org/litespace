import { users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { first } from "lodash";
import { Profile } from "passport";

export async function verify(
  accessToken: string,
  refershToken: string,
  profile: Profile,
  done: (error: Error | unknown | null, user?: IUser.Self) => void
): Promise<void> {
  try {
    const email = first(profile.emails);
    if (!email)
      throw new Error("User email is not provided; should never happen");

    const user = await users.findByEmail(email.value);
    if (user) return done(null, user);

    const info = await users.create({ email: email.value });
    return done(null, info);
  } catch (error) {
    done(error);
  }
}
