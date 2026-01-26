import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import slugify from 'slugify';

export interface IUser extends Document {
  name: string;
  slug: string;
  email: string;
  password?: string;
  phone?: string;
  photoURL?: string;
  hasOAuth: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  resetCode?: string;
  resetCodeExpires?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  comparePassword(inputPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, lowercase: true, unique: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email address'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Invalid phone number'],
      unique: true,
      sparse: true,
    },
    photoURL: { type: String, default: '' },
    hasOAuth: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date },
    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
  },
  { timestamps: true },
);

// Pre-save hook for password hashing and slug generation
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  // Import service functions dynamically to avoid circular dependencies
  const { prepareUserForSave } = await import('@/services/userService');
  await prepareUserForSave(user);

  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);