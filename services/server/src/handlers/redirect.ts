import { Request, Response } from "express";

export default function redirect(url: string) {
  return (req: Request, res: Response) => res.redirect(url);
}
