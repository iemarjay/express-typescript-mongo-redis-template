import { EventHandler } from "../../app/event";
import { APP_NAME } from "../../constants/app";
import MailgunNotificationChannel, {
  MailNotifiable,
} from "../../adapters/notification/channels/mailgun";
import { SendPin } from "../user";

export default class SendAuthenticationPin implements EventHandler<SendPin> {
  private readonly mailChannel: MailgunNotificationChannel;
  constructor(mailChannel: MailgunNotificationChannel) {
    this.mailChannel = mailChannel;
  }
  handle(event: SendPin): void {
    const user = this.getUser(event);
    const pin = event.pin;
    this.mailChannel.send(user, {
      subject: `${APP_NAME}: Authentication Pin`,
      text: `Hi ${user.firstname},\nLogin with the OTP below\n${pin}`,
    });
  }

  private getUser(event: SendPin) {
    return new (class implements MailNotifiable {
      get firstname(): string {
        return event.user.firstname;
      }

      get email(): string {
        return event.user.email;
      }

      routeForMailChannel(): string {
        return event.user.email;
      }
    })();
  }
}
