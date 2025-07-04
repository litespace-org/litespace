import { IDocmost } from "@litespace/types";
import axios, { AxiosInstance } from "axios";
import { first } from "lodash";

const BASE_URL = "https://handbook.litespace.org";

/**
 * @ref https://www.postman.com/docmost-api
 */
export class Docmost {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/api/auth/login", {
      email,
      password,
    });

    const cookei = first(response.headers["set-cookie"]);
    if (!cookei) throw new Error("no cookei found");

    // ref: https://regex101.com/r/vvKekk/1
    const regex = /authToken=([^;]*)/g;
    const match = regex.exec(cookei);
    const token = match?.[1];
    if (!token) throw new Error("no auth token found in the cookei");

    // create a new client with the auth token cookei
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async me(): Promise<unknown> {
    const { data } = await this.client.post("/api/users/me", {});
    return data;
  }

  async findSpaces(
    req?: IDocmost.FindSpacesApiRequest
  ): Promise<IDocmost.FindSpacesApiResponse> {
    const { data } = await this.client.post<IDocmost.FindSpacesApiResponse>(
      "/api/spaces",
      { page: req?.page, limit: req?.limit }
    );

    return data;
  }

  async findSpace(
    req: IDocmost.FindSpaceApiRequest
  ): Promise<IDocmost.FindSpaceApiResponse> {
    const { data } = await this.client.post("/api/spaces/info", {
      spaceId: req.spaceId,
    });
    return data;
  }

  async findPages(
    req: IDocmost.FindPagesApiRequest
  ): Promise<IDocmost.FindPagesApiResponse> {
    const { data } = await this.client.post("/api/pages/sidebar-pages", {
      spaceId: req.spaceId,
      page: req.page,
    });
    return data;
  }

  async exportPage(
    req: IDocmost.ExportPageApiRequest
  ): Promise<IDocmost.ExportPageApiResponse> {
    const { data } = await this.client.post("/api/pages/export", {
      pageId: req.pageId,
      format: req.format,
    });
    return data;
  }
}
