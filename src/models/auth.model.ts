import bcrypt from "bcryptjs";
import { Document, Schema, Types, model } from "mongoose";
import { string } from "zod/mini";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: Date;
  gender: "male" | "female" | "other";
  height: number;
  weight: number;
  role?: string;
  level: "beginner" | "intermediate" | "advanced";
  profilePicture: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    dob: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    height: Number,
    weight: Number,
    profilePicture: String,
    refreshToken: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>("User", userSchema);
export default User;
