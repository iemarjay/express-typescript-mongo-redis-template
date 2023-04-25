import jwt from "jsonwebtoken";
import { ENCRYPTION_SECRET } from "../constants/encryption";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticationUser } from "../controllers/authentication";
import { UserTypes } from "../constants/user";

export interface UserFinder {
  findUserById(id: string): Promise<AuthenticationUser>;
}

export interface JwtAuthMiddleware {
  middleware(role?: UserTypes): RequestHandler;
}

export default class JwtAuthenticator implements JwtAuthMiddleware {
  private readonly expiresIn = 60 * 60 * 24;

  private readonly secretOrPrivateKey = ENCRYPTION_SECRET;

  private readonly db: UserFinder;

  constructor(db: UserFinder) {
    this.db = db;
  }

  async loginUsingId(id: string) {
    return jwt.sign(
      {
        data: id,
      },
      this.secretOrPrivateKey,
      { expiresIn: this.expiresIn }
    );
  }

  async verify(token: string) {
    // @ts-ignore
    return jwt.verify(token, this.secretOrPrivateKey).data;
  }

  middleware(role?: UserTypes): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const authorization = req.headers?.authorization;
      if (!authorization) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "UNAUTHORIZED" });
      }
      const token: string = authorization.split(" ")[1];
      try {
        const userID = await this.verify(token);
        const user = await this.db.findUserById(userID);

        if (role && user.type != role) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "FORBIDDEN" });
        }
        res.locals.user = user;

        return next();
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: err });
      }
    };
  }
}
