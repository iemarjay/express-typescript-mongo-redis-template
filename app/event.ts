export interface EventEmitter {
  emit(event: any): void;
}

export interface EventListener {
  listen(event: string, handler: EventHandler<any>): void;
}

export interface EventHandler<T> {
  handle(event: T): void;
}

export default class Event implements EventEmitter, EventListener {
  private events = new Map<string, EventHandler<any>[]>();
  emit(event: any): void {
    this.events.get(event.constructor.name)?.forEach((handler) => {
      handler.handle(event);
    });
  }

  listen(event: string, handler: EventHandler<any>): void {
    const events = this.events.get(event);
    if (events) {
      events.push(handler);
      this.events.set(event, events);
    } else {
      this.events.set(event, [handler]);
    }
  }
}
