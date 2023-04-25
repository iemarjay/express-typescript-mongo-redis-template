import { UserFinder } from "../../app/jwtAuthenticator";
import { AuthDb, AuthenticationUser } from "../../controllers/authentication";
import User, { UserInterface } from "../../database/models/user";
import { ERROR_NOT_FOUND } from "../../constants/errors";

export default class MongoAuthDB implements UserFinder, AuthDb {
  async findUserByIdentifier(query: {
    identifier: string;
  }): Promise<AuthenticationUser> {
    const user = await User.findOne<UserInterface>({
      $or: [{ email: query.identifier }, { schoolId: query.identifier }],
    });
    if (!user) throw ERROR_NOT_FOUND;
    return user.toUser();
  }
  async findUserById(id: string): Promise<AuthenticationUser> {
    const user = await User.findById<UserInterface>(id);
    if (!user) throw ERROR_NOT_FOUND;
    return user.toUser();
  }
}
