import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
}

// Mongoose Schema
const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// Mongoose Model
const Users: Model<IUser> = mongoose.model<IUser>("Users", userSchema);

export default Users;
