import { entries } from "lodash";

export function safeFormData<
  T extends { [key: string]: string | Blob | undefined },
>() {
  const formData = new FormData();

  const append = <K extends keyof T>(key: K, value: T[K]) => {
    if (!value) return;
    formData.append(key.toString(), value);
  };

  return { append, done: () => formData };
}

export function asFormData<T extends object>(data: T) {
  const form = new FormData();

  for (const [key, value] of entries(data)) {
    form.append(key, value);
  }

  return form;
}
