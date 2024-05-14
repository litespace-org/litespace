import { User, user } from "@/database";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";

export async function create(
  req: Request.Body<Exclude<User.Self, "id">>,
  res: Response
) {
  const body = schema.user.create.parse(req.body);
  await user.create(body);
  res.status(200);
  res.send();
}
