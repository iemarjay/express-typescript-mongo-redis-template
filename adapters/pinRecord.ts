import Cache from "../app/cache";
import { ERROR_NOT_FOUND } from "../constants/errors";

export default class PinRecord {
  private readonly redis: Cache;

  constructor(redis: Cache) {
    this.redis = redis;
  }

  randomSixDigitPin(): string {
    const min = 100000;
    const difference = 999999 - min;

    // generate random number
    let rand = Math.random();

    // multiply with difference
    rand = Math.floor(rand * difference);

    // add with min value
    rand = rand + min;

    return rand.toString(10);
  }

  private readonly ttl = 60 * 60 * 24;

  async generatePinFor(id: string): Promise<string> {
    const pin = this.randomSixDigitPin();
    await this.redis.set(pin, id, this.ttl);
    return pin;
  }

  async verify(pin: string): Promise<string> {
    const id = await this.redis.pluck(pin);
    if (!id) {
      throw ERROR_NOT_FOUND;
    }

    return id;
  }
}
