import axios from "axios";

export class Recorder {
  async upload({
    blob,
    call,
    user,
  }: {
    blob: Blob;
    call: number;
    user: number;
  }) {
    const form = new FormData();
    form.append("chunk", blob);
    form.append("call", call.toString());
    form.append("user", user.toString());

    await axios.post(`http://localhost:9090/api/v1/call/chunk`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}
