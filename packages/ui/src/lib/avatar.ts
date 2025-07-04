export async function imageUrlToBase64(url: string): Promise<string> {
  const blob = await fetch(url).then((res) => res.blob());

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") return reject;
      if (!reader.result.startsWith("data:image")) return reject;
      const base64String = reader.result;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
