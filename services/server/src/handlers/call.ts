import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { withNamedId } from "@/validation/utils";
import { forbidden } from "@/lib/error";
import { isAdmin, isGhost, isUser } from "@litespace/auth";
import { CallsController } from "@/controllers/calls";

/*
  * express handler for retrieving a call object by its id
  */
async function findCallById(req: Request, res: Response, next: NextFunction) {
  const controller = new CallsController();
  try {
    // parse request params/body/queries
    const { callId } = withNamedId("callId").parse(req.params);

    // authorize the request
    const user = req.user;
    const allowed = isUser(user) || isGhost(user);
    if (!allowed) throw forbidden();

    const isMember = isUser(user) && await controller.isMember(user.id, callId);
    const eligible = isMember || isAdmin(req.user) || isGhost(user);
    if (!eligible) throw forbidden();

    // retrieve data from the database
    const call = await controller.getCallById(callId)
    const members = await controller.getCallMembers(callId);

    // send response to the client
    res.status(200).json({ call, members });
  } catch(e) {
    next(e);
  }
}

/*
  * express handler for retrieving a list of members of a specific call
  */
async function findCallMembers(req: Request, res: Response, next: NextFunction) {
  const controller = new CallsController();
  try {
    // parse request params/body/queries
    const { callId } = withNamedId("callId").parse(req.params);

    // authorize the request
    const user = req.user;
    const allowed = isUser(user) || isGhost(user);
    if (!allowed) throw forbidden();

    const isMember = isUser(user) && await controller.isMember(user.id, callId);
    const eligible = isMember || isAdmin(req.user) || isGhost(user);
    if (!eligible) throw forbidden();

    // retrieve data from the database
    const members = await controller.getCallMembers(callId);

    // send response to the client
    res.status(200).json({ members });
  } catch(e) {
    next(e);
  }
}

export default {
  findCallById: asyncHandler(findCallById),
  findCallMembers: asyncHandler(findCallMembers)
};
