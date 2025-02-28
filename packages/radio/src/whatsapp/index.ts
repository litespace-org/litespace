import init, {
  AnyMediaMessageContent,
  AnyRegularMessageContent,
  ConnectionState,
  DisconnectReason,
  MiscMessageGenerationOptions,
} from "baileys";
import {
  initFileStore,
  InitializedStore,
  initMemoryStore,
} from "@/whatsapp/store";
import { isBoom } from "@hapi/boom";

function shouldReconnect(error: unknown): boolean {
  return (
    isBoom(error) && error.output.statusCode !== DisconnectReason.loggedOut
  );
}

export class WhatsApp {
  socket: ReturnType<typeof init> | null = null;
  connection: ConnectionState["connection"] = "close";
  store: InitializedStore | null = null;
  qr: string | null = null;

  async withStore(type: "memory" | "file") {
    if (type === "memory") {
      this.store = initMemoryStore();
      return;
    }

    const folder = `__whatsapp__`;
    this.store = await initFileStore(folder);
  }

  connect(): WhatsApp {
    if (!this.store)
      throw new Error(
        "No store is currently selected. Use WhatsApp.withStore to configure one."
      );

    this.socket = init({
      auth: this.store.state,
      printQRInTerminal: true,
    });

    this.onConnectionUpdate();
    this.onCredsUpdate();
    return this;
  }

  async connectAsync(): Promise<void> {
    if (!this.store)
      throw new Error(
        "No store is currently selected. Use WhatsApp.withStore to configure one."
      );

    this.socket = init({
      auth: this.store.state,
      printQRInTerminal: true,
    });

    this.onCredsUpdate();

    return await new Promise<void>((resolve, reject) => {
      if (!this.socket) return reject(new Error("Socket is not initialized"));

      this.socket.ev.on("connection.update", (update) => {
        this.connection = update.connection || "close";
        if (update.qr) this.qr = update.qr;

        if (
          update.connection === "close" &&
          shouldReconnect(update.lastDisconnect?.error)
        )
          return this.connectAsync();

        if (update.connection === "open") return resolve();
      });
    });
  }

  private onConnectionUpdate() {
    if (!this.socket) throw new Error("Socket is not initialized");

    this.socket.ev.on("connection.update", (update) => {
      this.connection = update.connection || "close";

      console.log({
        reconnect:
          update.connection === "close" &&
          shouldReconnect(update.lastDisconnect?.error),
      });

      if (
        update.connection === "close" &&
        shouldReconnect(update.lastDisconnect?.error)
      )
        return this.connect();
    });
  }

  private onCredsUpdate() {
    if (!this.socket) throw new Error("Socket is not initialized");

    if (!this.store)
      throw new Error(
        "No store is currently selected. Use WhatsApp.withStore to configure one."
      );

    this.socket.ev.on("creds.update", this.store.saveCreds);
  }

  async sendMessage(
    id: string,
    content: AnyMediaMessageContent | AnyRegularMessageContent,
    options?: MiscMessageGenerationOptions
  ) {
    if (!this.socket) throw new Error("Socket is not initialized");
    if (this.connection !== "open")
      throw new Error("Connection is not stablished");

    return await this.socket.sendMessage(id, content, options);
  }

  asWhatsAppId(phone: string) {
    return `2${phone}@s.whatsapp.net`;
  }

  async sendContact(
    id: string,
    contact: {
      name: string;
      org?: string;
      waid: string;
      phone: string;
      display: string;
    }
  ) {
    const header = "BEGIN:VCARD\n" + "VERSION:3.0\n";
    const name = `FN:${contact.name}\n`;
    const org = contact.org ? `ORG:${contact.org}\n` : "";
    const tel = `TEL;type=CELL;type=VOICE;waid=${contact.waid}:${contact.phone}\n`;
    const end = "END:VCARD";
    const vcard = header + name + org + tel + end;
    return await this.sendMessage(id, {
      contacts: {
        displayName: contact.display,
        contacts: [{ vcard }],
      },
    });
  }
}
