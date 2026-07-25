export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  from: {
    address: string;
    name?: string;
  };
}

export interface MailDriver {
  send(message: MailMessage): Promise<void>;
}
