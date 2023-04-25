import { UserTypes } from "../constants/user";

export default class User {}

export interface UserData {
  id: string;
  firstname: string;
  lastname: string;
  fullName: string;
  email: string;
  password?: string;
  type: UserTypes;
}
