import { Notifiable, NotificationChannel } from "../../../app/notification";
import Mailgun from "mailgun.js";
import FormData from "form-data";
import {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_FROM,
} from "../../../constants/mail";
import Client from "mailgun.js/client";

export interface MailNotifiable {
  routeForMailChannel(): string;
}

export default class MailgunNotificationChannel
  implements NotificationChannel<MailgunData, MailNotifiable>
{
  protected readonly options: MailgunChannelOptions;
  protected readonly client: Client;

  constructor(options: MailgunChannelOptions) {
    this.options = options;
    this.client = new Mailgun(FormData).client({
      username: "api",
      key: this.options.apiKey,
    });
  }

  async send(notifiable: MailNotifiable, message: MailgunData): Promise<void> {
    message.from = message.from || this.options.from;
    message.to = message.to || notifiable.routeForMailChannel();

    await this.client.messages.create(this.options.domain, message);
  }

  static initializeFromEnv(): MailgunNotificationChannel {
    return new MailgunNotificationChannel({
      from: MAILGUN_FROM,
      domain: MAILGUN_DOMAIN,
      apiKey: MAILGUN_API_KEY,
    });
  }
}

export interface MailgunChannelOptions {
  from: string;
  domain: string;
  apiKey: string;
}
export interface MailgunData {
  to?: string;
  from?: string;
  subject: string;
  text: string;
}
