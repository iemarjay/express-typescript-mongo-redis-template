export default class Notification {
  notify(notifiable: Notifiable, message: Message<any, any>) {
    message.via(notifiable).forEach((channel) => {
      channel.send(notifiable, message);
    });
  }
}

export interface Notifiable {}

export interface NotificationChannel<T, U> {
  send(notifiable: U, message: T): Promise<void>;
}

export interface Message<T, U> {
  via(notifiable: U): NotificationChannel<T, U>[];
}
