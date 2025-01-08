type Append<T extends { [key: string]: string | Blob }> = (
  key: keyof T,
  vaue: T[keyof T]
) => void;

export function safeFormData<
  T extends { [key: string]: string | Blob | undefined }
>() {
  const formData = new FormData();

  const append = <K extends keyof T>(key: K, value: T[K]) => {
    if (!value) return;
    formData.append(key.toString(), value);
  };

  return { append, done: () => formData };
}
