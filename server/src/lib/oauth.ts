import { users } from "@/models";
import { first } from "lodash";
import { DoneCallback, Profile } from "passport";
import { VerifiedCallback } from "passport-custom";

export async function verify(
  accessToken: string,
  refershToken: string,
  profile: Profile,
  done: DoneCallback | VerifiedCallback
): Promise<void> {
  try {
    const email = first(profile.emails);
    if (!email)
      throw new Error("User email is not provided; should never happen");

    const user = await users.findByEmail(email.value);
    if (user) return done(null, user);

    const info = await users.createWithEmailOnly(email.value);
    return done(null, info);
  } catch (error) {
    done(error);
  }
}
