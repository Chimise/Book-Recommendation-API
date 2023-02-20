import Base from "./base";

export interface UserI {
  full_name: string;
  email: string;
  password: string;
  password_reset_expires: string;
  password_reset_token: string;
  email_verified: boolean;
}

interface UserSchema extends UserI, Base {}

export default UserSchema;
