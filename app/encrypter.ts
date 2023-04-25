import bcrypt from "bcrypt";

export default class Encrypter {
  private readonly saltRounds = 10;
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
