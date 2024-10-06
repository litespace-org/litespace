declare module "aripsum" {
  export default class Aripsum {
    constructor(wordType: "regular" | "tafila") {}
    generateSentence(min?: number, max?: number): string {}
    generateParagraph(min?: number, max?: number): string {}
  }
}
