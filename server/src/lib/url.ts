export class Url {
  private url: URL;

  constructor(url: string | URL, base?: string | URL) {
    this.url = new URL(url, base);
  }

  withParam(key: string, value: string): Url {
    this.url.searchParams.append(key, value);
    return this;
  }

  toString(): string {
    return this.url.toString();
  }
}
