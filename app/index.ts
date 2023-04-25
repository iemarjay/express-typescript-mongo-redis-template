import express from "express";
import cors from "cors";
import { PORT } from "../constants/http";
import Event from "./event";
import Mongoose from "../database/mongoose";
import dotenv from "dotenv";
import AuthenticationController from "../controllers/authentication";
import MongoAuthDB from "../adapters/mongo/authDB";
import Encrypter from "./encrypter";
import JwtAuthenticator from "./jwtAuthenticator";
import PinRecord from "../adapters/pinRecord";
import Cache, { RedisCache } from "./cache";
import SendAuthenticationPin from "../events/handlers/sendAuthenticationPin";
import MailgunNotificationChannel from "../adapters/notification/channels/mailgun";
import { SendPin } from "../events/user";

dotenv.config();

export default class App {
  // @ts-ignore
  private cache: Cache;

  private readonly express = express();
  private readonly mongoose = new Mongoose();
  private readonly emitter = new Event();
  protected readonly mailChannel =
    MailgunNotificationChannel.initializeFromEnv();
  protected readonly mongoAuthDB = new MongoAuthDB();

  async startExpressWithRedisMongoDb() {
    await this.useRedisCache();

    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));

    await this.mongoose.start();

    this.registerEventListeners();
    this.registerControllersRoutes();

    this.express.listen(PORT, () => {
      console.log("app listening on:");
      console.log(`http://localhost:${PORT}`);
    });
  }

  private registerControllersRoutes(): App {
    this.express.use(this.makeAuthenticationController().registerRoutes());

    return this;
  }

  private registerEventListeners() {
    this.emitter.listen(
      SendPin.name,
      new SendAuthenticationPin(this.mailChannel)
    );
  }

  private async useRedisCache() {
    this.cache = await RedisCache.initFromEnv();
  }

  private makeAuthenticationController() {
    const mongoAuthDB = new MongoAuthDB();

    return new AuthenticationController(
      mongoAuthDB,
      new Encrypter(),
      new JwtAuthenticator(mongoAuthDB),
      this.emitter,
      new PinRecord(this.cache)
    );
  }
}
