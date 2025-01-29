import xss, { IFilterXSSOptions } from "xss";

const sanitizeConf: IFilterXSSOptions = {
  whiteList: {
    b: [],
    i: [],
    strong: [],
    p: [],
    ul: [],
    li: [],
    br: [],
    div: [],
    h3: [],
  },
  singleQuotedAttributeValue: true,
};
const startBreaks = /^(<div><br><\/div>|<br>)+/;
const endBreaks = /(<div><br><\/div>|<br>)+$/;

export function sanitizeMessage(message: string): string {
  return xss(message, sanitizeConf)
    .replace(startBreaks, "")
    .replace(endBreaks, "");
}
