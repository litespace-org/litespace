import { Base } from "@/lib/base";
import { IIntroVideo } from "@litespace/types";
import { AxiosProgressEvent } from "axios";

export class IntroVideo extends Base {
  async find(
    payload: IIntroVideo.FindApiPayload
  ): Promise<IIntroVideo.FindApiResponse> {
    return this.get({
      route: "/api/v1/intro-video/list",
      payload,
    });
  }

  async create(
    payload: IIntroVideo.CreateApiPayload &
      IIntroVideo.CreateApiFiles & {
        onUploadProgress?: (event: AxiosProgressEvent) => void;
        abortSignal?: AbortSignal;
      }
  ): Promise<IIntroVideo.CreateApiResponse> {
    const formData = new FormData();
    formData.append("duration", payload.duration.toString());

    if (payload.video) {
      formData.append(
        IIntroVideo.AssetFileName.Video,
        new File([payload.video], IIntroVideo.AssetFileName.Video)
      );
    }

    await this.client.post<void>(`/api/v1/intro-video/with/asset`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: payload.onUploadProgress,
      signal: payload.abortSignal,
    });
  }

  async update(
    id: number,
    payload: IIntroVideo.UpdateApiPayload
  ): Promise<IIntroVideo.UpdateApiResponse> {
    return this.put({
      route: `/api/v1/intro-video/${id}`,
      payload,
    });
  }
}
