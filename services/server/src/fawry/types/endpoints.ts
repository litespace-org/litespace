import { Paths } from "@/fawry/constants"
import { Requests } from "@/fawry/types"
import { Responses } from "@/fawry/types"

export interface FawryEndpoint {
  path: typeof Paths[keyof typeof Paths],
  request: object,
  response: object,
}

export interface PayWithCardEndpoint extends FawryEndpoint {
  path: typeof Paths.PAY_WITH_CARD,
  request: Requests.PayWithCardPayload,
  response: Responses.PayWithCardResponse,
}
