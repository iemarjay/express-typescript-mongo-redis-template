import { Request, RequestHandler, Response, Router } from "express";
import Encrypter from "../app/encrypter";
import { StatusCodes } from "http-status-codes";
import JwtAuthenticator, { UserFinder } from "../app/jwtAuthenticator";
import { UserTypes } from "../constants/user";
import { EventEmitter } from "../app/event";
import { ERROR_NOT_FOUND } from "../constants/errors";
import PinRecord from "../adapters/pinRecord";
import { SendPin } from "../events/user";

export default class AuthenticationController {
  private readonly router = Router();

  private readonly db: AuthDb;

  private readonly encrypter: Encrypter;

  private readonly authenticator: JwtAuthenticator;

  private readonly emitter: EventEmitter;

  private readonly pin: PinRecord;

  constructor(
    db: AuthDb,
    encrypter: Encrypter,
    authenticator: JwtAuthenticator,
    emitter: EventEmitter,
    pin: PinRecord
  ) {
    this.db = db;
    this.encrypter = encrypter;
    this.authenticator = authenticator;
    this.emitter = emitter;
    this.pin = pin;
  }

  registerRoutes(): Router {
    this.router.post("/authentication/login", this.login());
    this.router.post("/authentication/pin/send", this.pinSend());
    this.router.post("/authentication/pin/login", this.pinLogin());

    this.router.get(
      "/authentication/show",
      this.authenticator.middleware(),
      this.show()
    );

    return this.router;
  }

  private login(): RequestHandler {
    return async (
      req: Request<{}, { identifier: string; password: string }>,
      res: Response
    ) => {
      try {
        const user = await this.db.findUserByIdentifier({
          identifier: req.body.identifier,
        });

        if (
          !(await this.encrypter.compare(
            req.body.password,
            user.password as string
          ))
        ) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "UNAUTHORIZED" });
        }

        const token = await this.authenticator.loginUsingId(user.id);

        return res.status(StatusCodes.OK).json({
          user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            schoolId: user.schoolId,
            type: user.type,
          },
          token,
        });
      } catch (e) {
        console.error(e);
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "UNAUTHORIZED" });
      }
    };
  }

  private show(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (!res.locals.user)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "UNAUTHORIZED" });

      try {
        const user = res.locals.user;
        return res.status(StatusCodes.OK).json({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          type: user.type,
        });
      } catch (e: any) {
        console.error(e);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json(e ? e.message : "INTERNAL_SERVER_ERROR");
      }
    };
  }

  private pinSend(): RequestHandler {
    return async (
      req: Request<{}, {}, { identifier: string }>,
      res: Response
    ) => {
      const user = await this.db.findUserByIdentifier({
        identifier: req.body.identifier,
      });
      this.emitter.emit(
        new SendPin(user, await this.pin.generatePinFor(user.id))
      );

      return res.json({ sent: true, status: "success" });
    };
  }

  private pinLogin(): RequestHandler {
    return async (req: Request<any, any, { pin: string }>, res: Response) => {
      try {
        const id = await this.pin.verify(req.body.pin);
        const user = await this.db.findUserById(id);
        const token = await this.authenticator.loginUsingId(user.id);

        return res.status(StatusCodes.OK).json({
          user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            schoolId: user.schoolId,
            type: user.type,
          },
          token,
        });
      } catch (e: any) {
        console.error(e);
        if (e === ERROR_NOT_FOUND) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "UNAUTHORIZED" });
        }

        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json(e ? e.message : "INTERNAL_SERVER_ERROR");
      }
    };
  }
}

export interface AuthenticationUser {
  id: string;
  fullName: string;
  firstname: string;
  lastname: string;
  schoolId: string;
  email: string;
  password: string;
  faculty: string;
  department: string;
  type: UserTypes;
}

export interface AuthDb extends UserFinder {
  findUserByIdentifier(query: {
    identifier: string;
  }): Promise<AuthenticationUser>;
}
