import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface User extends Document {
      _id: string;
      name: string;
      email: string;
      role: string;
      isVerified: boolean;
      getSignedJwtToken(): string;
      matchPassword(enteredPassword: string): Promise<boolean>;
    }

    interface Request {
      user?: User;
    }
  }
}

export interface IUserRequest extends Request {
  user?: Express.User;
}
