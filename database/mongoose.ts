import { connect } from "mongoose";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_USERNAME,
} from "../constants/database";

export async function startMongoose() {
  const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
  // @ts-ignore
  await connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

export default class Mongoose {
  // @ts-ignore
  protected client: object;

  async start() {
    this.client = await connect(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`,
      // @ts-ignore
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
  }
}
