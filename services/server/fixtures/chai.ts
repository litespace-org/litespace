import { expect, use } from "chai";
// @ts-expect-error - we are getting the following error: "The current file is a CommonJS module whose imports will produce...."
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export { expect };
