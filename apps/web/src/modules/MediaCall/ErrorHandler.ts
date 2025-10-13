import { CallError, CallErrorMessage } from "@/modules/MediaCall/types";

type Fn = (...unknown: unknown[]) => unknown;

export class ErrorHandler {
  private callbacks: Record<CallError, Array<Fn>>;
  private log: Fn = console.error;

  constructor(logFn?: Fn) {
    this.callbacks = {
      [CallError.IndexOutOfRange]: [],
      [CallError.FullSession]: [],
      [CallError.CannotRemoveJoinedMember]: [],
      [CallError.NotAllowedToJoinSession]: [],
      [CallError.MemberAlreadyInSession]: [],
      [CallError.UserMediaAccessDenied]: [],
      [CallError.DisplayMediaAccessDenied]: [],
      [CallError.TrackNotFound]: [],
      [CallError.MicNotFound]: [],
      [CallError.CamNotFound]: [],
      [CallError.ScreenNotFound]: [],
    };
    if (logFn) this.log = logFn;
  }

  on(err: CallError, callback: () => unknown) {
    if (this.callbacks[err].length > 0)
      console.warn(`error-event ${CallErrorMessage[err]} has been overrided!`);
    this.callbacks[err][0] = callback;
  }

  throw(err: CallError) {
    this.log(CallErrorMessage[err]);
    for (const fn of this.callbacks[err]) fn();
  }

  reset() {
    this.callbacks = {
      [CallError.IndexOutOfRange]: [],
      [CallError.FullSession]: [],
      [CallError.CannotRemoveJoinedMember]: [],
      [CallError.NotAllowedToJoinSession]: [],
      [CallError.MemberAlreadyInSession]: [],
      [CallError.UserMediaAccessDenied]: [],
      [CallError.DisplayMediaAccessDenied]: [],
      [CallError.TrackNotFound]: [],
      [CallError.MicNotFound]: [],
      [CallError.CamNotFound]: [],
      [CallError.ScreenNotFound]: [],
    };
  }
}
