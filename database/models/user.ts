import { USER_TYPES_ARRAY, UserTypes } from "../../constants/user";
import { model, Schema } from "mongoose";
import { UserData } from "../../utilties/user";

export interface UserInterface {
  readonly id: string;
  firstname: string;
  lastname: string;
  readonly fullName: string;
  email: string;
  password?: string;
  type: UserTypes;
  toUser(): UserData;
}

const schema = new Schema<UserInterface>(
  {
    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    password: String,
    type: { type: String, enum: USER_TYPES_ARRAY },
  },
  {
    timestamps: true,
    methods: {
      toUser(): UserData {
        return {
          email: this.email,
          firstname: this.firstname,
          fullName: this.fullName,
          id: this._id.toString(),
          lastname: this.lastname,
          password: this.password as string,
          type: this.type,
        };
      },
    },
  }
);

schema.virtual("fullName").get(function () {
  return [this.firstname, this.lastname].join(" ");
});

const User = model<UserInterface>("User", schema);

export default User;
