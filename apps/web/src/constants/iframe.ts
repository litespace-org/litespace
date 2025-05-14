type CloseAction = {
  action: "close";
};

type TryAgainAction = {
  action: "try-again";
};

type ReportAction = {
  action: "report";
  fawryErrorCode: number;
  fawryErrorDescription: string;
};

export type IFrameMessage = CloseAction | TryAgainAction | ReportAction;
