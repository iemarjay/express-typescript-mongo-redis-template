import Joi from "joi";

export default class Validator {
  async validate<T>(schema: Record<string, any>, input: T): Promise<T> {
    await Joi.object(schema).options({ abortEarly: false }).validate(input);

    return input;
  }

  string() {
    return Joi.string();
  }

  date() {
    return Joi.date();
  }

  array() {
    return Joi.array();
  }

  object() {
    return Joi.object();
  }
}
